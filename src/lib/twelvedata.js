const API_KEY = import.meta.env.VITE_TWELVE_DATA_API_KEY;
const BASE_URL = 'https://api.twelvedata.com';

/**
 * Format ticker for Twelve Data API based on exchange
 * NSE stocks -> TICKER:NSE, BSE -> TICKER:BSE, US stocks -> TICKER
 */
function formatTicker(ticker, exchange) {
  if (exchange === 'NSE') return `${ticker}:NSE`;
  if (exchange === 'BSE') return `${ticker}:BSE`;
  return ticker;
}

/**
 * Fetch live prices for multiple tickers at once using batch endpoint
 * @param {Array<{ticker: string, exchange: string}>} stocks
 * @returns {Object} { [ticker]: { price, change, changePercent, high, low, volume } }
 */
export async function fetchBatchPrices(stocks) {
  if (!stocks || stocks.length === 0) return {};

  try {
    const symbols = stocks.map(s => formatTicker(s.ticker, s.exchange)).join(',');
    const response = await fetch(
      `${BASE_URL}/price?symbol=${symbols}&apikey=${API_KEY}`
    );
    const data = await response.json();

    const result = {};

    // If single stock, response is { price: "..." }
    // If multiple, response is { "TICKER:EXCHANGE": { price: "..." }, ... }
    if (stocks.length === 1) {
      const stock = stocks[0];
      result[stock.ticker] = {
        price: parseFloat(data.price) || 0,
        change: 0,
        changePercent: 0,
        high: 0,
        low: 0,
        volume: 0,
      };
    } else {
      for (const stock of stocks) {
        const key = formatTicker(stock.ticker, stock.exchange);
        const priceData = data[key];
        if (priceData && priceData.price) {
          result[stock.ticker] = {
            price: parseFloat(priceData.price) || 0,
            change: 0,
            changePercent: 0,
            high: 0,
            low: 0,
            volume: 0,
          };
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching batch prices:', error);
    return {};
  }
}

/**
 * Fetch detailed quote for a single ticker (includes change, high, low, volume)
 */
export async function fetchQuote(ticker, exchange) {
  try {
    const symbol = formatTicker(ticker, exchange);
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&apikey=${API_KEY}`
    );
    const data = await response.json();

    return {
      price: parseFloat(data.close) || 0,
      change: parseFloat(data.change) || 0,
      changePercent: parseFloat(data.percent_change) || 0,
      high: parseFloat(data.high) || 0,
      low: parseFloat(data.low) || 0,
      volume: parseInt(data.volume) || 0,
      open: parseFloat(data.open) || 0,
      previousClose: parseFloat(data.previous_close) || 0,
      fiftyTwoWeekHigh: parseFloat(data.fifty_two_week?.high) || 0,
      fiftyTwoWeekLow: parseFloat(data.fifty_two_week?.low) || 0,
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

/**
 * Fetch time series data for charts
 * @param {string} ticker
 * @param {string} exchange
 * @param {string} interval - 1min, 5min, 15min, 1h, 1day, 1week, 1month
 * @param {number} outputsize - number of data points
 */
export async function fetchTimeSeries(ticker, exchange, interval = '1day', outputsize = 30) {
  try {
    const symbol = formatTicker(ticker, exchange);
    const response = await fetch(
      `${BASE_URL}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.values) {
      return data.values.map(v => ({
        datetime: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume),
      })).reverse(); // Return chronological order
    }
    return [];
  } catch (error) {
    console.error('Error fetching time series:', error);
    return [];
  }
}

/**
 * Search for stock symbols (with debounce in the calling component)
 */
export async function searchSymbols(query) {
  if (!query || query.length < 1) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/symbol_search?symbol=${query}&apikey=${API_KEY}`
    );
    const data = await response.json();

    if (data.data) {
      return data.data.map(s => ({
        symbol: s.symbol,
        name: s.instrument_name,
        exchange: s.exchange,
        type: s.instrument_type,
        country: s.country,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error searching symbols:', error);
    return [];
  }
}
