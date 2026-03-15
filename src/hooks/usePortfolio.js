import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import { fetchBatchPrices, fetchQuote, fetchTimeSeries } from '../lib/twelvedata';

export function usePortfolio() {
  const [holdings, setHoldings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const { user, stockPrices, setStockPrices, lastPriceUpdate } = useStore();
  const intervalRef = useRef(null);

  // Fetch portfolio holdings from Supabase
  const fetchHoldings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHoldings(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching holdings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch watchlist from Supabase
  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      if (error) throw error;
      setWatchlist(data || []);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
    }
  }, [user]);

  // Fetch live prices for all holdings
  const refreshPrices = useCallback(async (stocks = null) => {
    const stockList = stocks || holdings;
    if (stockList.length === 0) {
      setPricesLoading(false);
      return;
    }
    try {
      setPricesLoading(true);
      const prices = await fetchBatchPrices(
        stockList.map(h => ({ ticker: h.ticker, exchange: h.exchange }))
      );

      // Also fetch detailed quotes for change data
      const detailedPrices = {};
      for (const stock of stockList) {
        const quote = await fetchQuote(stock.ticker, stock.exchange);
        if (quote) {
          detailedPrices[stock.ticker] = quote;
        } else if (prices[stock.ticker]) {
          detailedPrices[stock.ticker] = prices[stock.ticker];
        }
      }

      setStockPrices(detailedPrices);
    } catch (err) {
      console.error('Error refreshing prices:', err);
    } finally {
      setPricesLoading(false);
    }
  }, [holdings, setStockPrices]);

  // Set up 60-second price polling
  useEffect(() => {
    if (holdings.length > 0) {
      refreshPrices();
      intervalRef.current = setInterval(() => refreshPrices(), 60000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [holdings.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      const h = await fetchHoldings();
      await fetchWatchlist();
      if (h && h.length > 0) {
        await refreshPrices(h);
      } else {
        setPricesLoading(false);
      }
    };
    init();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calculate portfolio metrics
  const getPortfolioMetrics = useCallback(() => {
    let totalInvested = 0;
    let totalValue = 0;
    let todayPnL = 0;

    holdings.forEach(h => {
      const invested = Number(h.shares) * Number(h.avg_buy_price);
      const price = stockPrices[h.ticker]?.price || Number(h.avg_buy_price);
      const value = Number(h.shares) * price;
      const change = stockPrices[h.ticker]?.change || 0;

      totalInvested += invested;
      totalValue += value;
      todayPnL += Number(h.shares) * change;
    });

    const totalPnL = totalValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const todayPnLPercent = totalValue > 0 ? (todayPnL / totalValue) * 100 : 0;

    return {
      totalInvested,
      totalValue,
      totalPnL,
      totalPnLPercent,
      todayPnL,
      todayPnLPercent,
      holdingsCount: holdings.length,
      uniqueStocks: new Set(holdings.map(h => h.ticker)).size,
    };
  }, [holdings, stockPrices]);

  // Get portfolio allocation for donut chart
  const getAllocation = useCallback(() => {
    return holdings.map(h => {
      const price = stockPrices[h.ticker]?.price || Number(h.avg_buy_price);
      const value = Number(h.shares) * price;
      return {
        ticker: h.ticker,
        companyName: h.company_name,
        value,
      };
    }).sort((a, b) => b.value - a.value);
  }, [holdings, stockPrices]);

  const addHolding = async (holding) => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .insert([{ ...holding, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setHoldings(prev => [data, ...prev]);
      // Fetch price for new holding
      const quote = await fetchQuote(data.ticker, data.exchange);
      if (quote) setStockPrices({ [data.ticker]: quote });
      return data;
    } catch (err) {
      console.error('Error adding holding:', err);
      throw err;
    }
  };

  const updateHolding = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('portfolio')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setHoldings(prev => prev.map(h => h.id === id ? data : h));
      return data;
    } catch (err) {
      console.error('Error updating holding:', err);
      throw err;
    }
  };

  const removeHolding = async (id) => {
    try {
      const { error } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setHoldings(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error removing holding:', err);
      throw err;
    }
  };

  // Watchlist operations
  const addToWatchlist = async (item) => {
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert([{ ...item, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      setWatchlist(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      throw err;
    }
  };

  const removeFromWatchlist = async (id) => {
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setWatchlist(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      throw err;
    }
  };

  return {
    holdings,
    watchlist,
    stockPrices,
    loading,
    pricesLoading,
    lastPriceUpdate,
    fetchHoldings,
    fetchWatchlist,
    refreshPrices,
    getPortfolioMetrics,
    getAllocation,
    addHolding,
    updateHolding,
    removeHolding,
    addToWatchlist,
    removeFromWatchlist,
    fetchTimeSeries,
  };
}
