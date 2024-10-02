import { fetchKlines } from './binanceService';

const timeFrames = {
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000
};

export const getNextCandleCloseTime = (timeFrame) => {
  const now = Date.now();
  const interval = timeFrames[timeFrame];
  return Math.ceil(now / interval) * interval;
};

export const waitForNextCandle = (symbol, timeFrame, callback) => {
  let timeoutId;

  const fetchAndUpdate = async () => {
    const nextCloseTime = getNextCandleCloseTime(timeFrame);
    const delay = nextCloseTime - Date.now();
    
    console.log(`Waiting for next ${timeFrame} candle close in ${delay}ms`);
    
    timeoutId = setTimeout(async () => {
      console.log(`Fetching data for ${symbol} ${timeFrame}`);
      const klines = await fetchKlines(symbol, timeFrame, 19);
      console.log(`Fetched data for ${symbol} ${timeFrame}:`, klines);
      callback(klines);
      fetchAndUpdate(); // Schedule next update
    }, delay);
  };

  fetchAndUpdate(); // Start the cycle

  // Return a cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
};
