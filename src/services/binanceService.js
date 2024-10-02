import axios from 'axios';

const BASE_URL = 'https://api.binance.com/api/v3';

export const fetchKlines = async (symbol, interval, limit = 501) => {
  try {
    console.log(`Fetching ${limit} klines for ${symbol} ${interval}`);
    const response = await axios.get(`${BASE_URL}/klines`, {
      params: {
        symbol: symbol,
        interval: interval,
        limit: limit
      }
    });
    const klines = response.data.map(kline => ({
      openTime: new Date(kline[0]),
      openPrice: parseFloat(kline[1]),
      highPrice: parseFloat(kline[2]),
      lowPrice: parseFloat(kline[3]),
      closePrice: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
      closeTime: new Date(kline[6])
    }));
    console.log(`Fetched ${klines.length} klines for ${symbol} ${interval}`);
    return klines;
  } catch (error) {
    console.error('Binance API hatası:', error);
    return [];
  }
};
