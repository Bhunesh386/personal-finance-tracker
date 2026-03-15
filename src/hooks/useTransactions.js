import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useStore from '../store/useStore';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useStore();

  const {
    type,
    search,
    startDate,
    endDate,
    page = 1,
    pageSize = 20,
    categoryId,
  } = filters;

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      let query = supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color)', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (type && type !== 'all') {
        query = query.eq('type', type);
      }
      if (search) {
        query = query.or(`description.ilike.%${search}%,merchant.ilike.%${search}%`);
      }
      if (startDate) {
        query = query.gte('date', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
        query = query.lte('date', format(endDate, 'yyyy-MM-dd'));
      }
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [user, type, search, startDate, endDate, page, pageSize, categoryId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Get monthly totals for the current month
  const getMonthlyTotals = useCallback(async (date = new Date()) => {
    if (!user) return { income: 0, expense: 0 };
    try {
      const start = format(startOfMonth(date), 'yyyy-MM-dd');
      const end = format(endOfMonth(date), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end);

      if (error) throw error;

      const income = (data || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expense = (data || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { income, expense, savings: income - expense };
    } catch (err) {
      console.error('Error getting monthly totals:', err);
      return { income: 0, expense: 0, savings: 0 };
    }
  }, [user]);

  // Get totals grouped by month for the last N months
  const getMonthlyHistory = useCallback(async (months = 6) => {
    if (!user) return [];
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount, date')
        .eq('user_id', user.id)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date');

      if (error) throw error;

      // Group by month
      const monthlyData = {};
      (data || []).forEach(t => {
        const monthKey = format(new Date(t.date), 'MMM yyyy');
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
        }
        if (t.type === 'income') monthlyData[monthKey].income += Number(t.amount);
        if (t.type === 'expense') monthlyData[monthKey].expense += Number(t.amount);
      });

      return Object.values(monthlyData);
    } catch (err) {
      console.error('Error getting monthly history:', err);
      return [];
    }
  }, [user]);

  // Get spending by category for a given period
  const getSpendingByCategory = useCallback(async (start, end) => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, categories(id, name, icon, color)')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      const categoryTotals = {};
      (data || []).forEach(t => {
        const cat = t.categories;
        if (!cat) return;
        if (!categoryTotals[cat.id]) {
          categoryTotals[cat.id] = {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            total: 0,
          };
        }
        categoryTotals[cat.id].total += Number(t.amount);
      });

      return Object.values(categoryTotals).sort((a, b) => b.total - a.total);
    } catch (err) {
      console.error('Error getting spending by category:', err);
      return [];
    }
  }, [user]);

  // Get top merchants
  const getTopMerchants = useCallback(async (start, end, limit = 10) => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, merchant, categories(name)')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))
        .not('merchant', 'is', null);

      if (error) throw error;

      const merchantTotals = {};
      (data || []).forEach(t => {
        if (!t.merchant) return;
        if (!merchantTotals[t.merchant]) {
          merchantTotals[t.merchant] = {
            merchant: t.merchant,
            category: t.categories?.name || 'Uncategorized',
            count: 0,
            total: 0,
          };
        }
        merchantTotals[t.merchant].count++;
        merchantTotals[t.merchant].total += Number(t.amount);
      });

      const sorted = Object.values(merchantTotals).sort((a, b) => b.total - a.total).slice(0, limit);
      const grandTotal = sorted.reduce((s, m) => s + m.total, 0);
      return sorted.map((m, i) => ({ ...m, rank: i + 1, percent: grandTotal ? (m.total / grandTotal * 100) : 0 }));
    } catch (err) {
      console.error('Error getting top merchants:', err);
      return [];
    }
  }, [user]);

  // Get daily spending for heatmap
  const getDailySpending = useCallback(async (start, end) => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, date')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      const dailyTotals = {};
      (data || []).forEach(t => {
        if (!dailyTotals[t.date]) dailyTotals[t.date] = 0;
        dailyTotals[t.date] += Number(t.amount);
      });

      return Object.entries(dailyTotals).map(([date, amount]) => ({ date, amount }));
    } catch (err) {
      console.error('Error getting daily spending:', err);
      return [];
    }
  }, [user]);

  const addTransaction = async (transaction) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select('*, categories(id, name, icon, color)')
        .single();
      if (error) throw error;
      setTransactions(prev => [data, ...prev]);
      setTotalCount(prev => prev + 1);
      return data;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select('*, categories(id, name, icon, color)')
        .single();
      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setTransactions(prev => prev.filter(t => t.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    totalCount,
    fetchTransactions,
    getMonthlyTotals,
    getMonthlyHistory,
    getSpendingByCategory,
    getTopMerchants,
    getDailySpending,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
