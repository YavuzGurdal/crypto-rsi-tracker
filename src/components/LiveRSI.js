import React, { useState, useEffect, useCallback } from 'react';
import { fetchKlines } from '../services/binanceService';
import './LiveRSI.css';

const MAIN_COINS = ['BTCUSDT', 'ETHUSDT'];
const ADDITIONAL_COINS = [
  'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT', 'DOTUSDT',
  'UNIUSDT', 'BCHUSDT', 'LTCUSDT', 'LINKUSDT', 'MATICUSDT',
  'XLMUSDT', 'ETCUSDT', 'THETAUSDT', 'VETUSDT', 'FILUSDT',
  'TRXUSDT', 'EOSUSDT', 'AAVEUSDT', 'ATOMUSDT', 'NEOUSDT'
];
const ALL_COINS = [...MAIN_COINS, ...ADDITIONAL_COINS];
const TIME_FRAMES = ['1m', '5m', '15m', '4h'];

const calculateRSI = (closePrices, period) => {
  if (closePrices.length < period + 1) {
    return Array(closePrices.length).fill('Yetersiz veri');
  }

  let gains = 0;
  let losses = 0;

  // İlk RSI hesaplaması için ortalama kazanç ve kayıpları hesapla
  for (let i = 1; i <= period; i++) {
    const difference = closePrices[i] - closePrices[i - 1];
    if (difference >= 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiValues = [];
  rsiValues.push(100 - (100 / (1 + avgGain / avgLoss)));

  // Kalan veriler için RSI'yı güncelle
  for (let i = period + 1; i < closePrices.length; i++) {
    const difference = closePrices[i] - closePrices[i - 1];
    let currentGain = 0;
    let currentLoss = 0;

    if (difference >= 0) {
      currentGain = difference;
    } else {
      currentLoss = -difference;
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rsiValues.push(100 - (100 / (1 + avgGain / avgLoss)));
  }

  return rsiValues;
};

const formatTime = (date) => {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatRSI = (rsi) => {
  return typeof rsi === 'number' ? rsi.toFixed(2) : 'N/A';
};

const RSITable = ({ timeFrame, rsiData }) => {
  return (
    <div className="rsi-table-container">
      <h3>{timeFrame} RSI Değerleri</h3>
      <table className="rsi-table">
        <thead>
          <tr>
            <th>COIN NAME</th>
            <th>MA</th>
            <th>MK</th>
            <th>RSI 1 (7)</th>
            <th>RSI 2 (14)</th>
            <th>RSI 3 (21)</th>
          </tr>
        </thead>
        <tbody>
          {MAIN_COINS.flatMap((coinName, coinIndex) => {
            const values = rsiData[coinName] || [];
            return values.map(({ openTime, closeTime, rsi1, rsi2, rsi3 }, index) => (
              <tr key={`${coinName}-${index}`} className={index === 0 && coinIndex === 1 ? 'coin-separator' : ''}>
                <td>{coinName.replace('USDT', '')}</td>
                <td>{formatTime(openTime)}</td>
                <td>{formatTime(closeTime)}</td>
                <td>{formatRSI(rsi1)}</td>
                <td>{formatRSI(rsi2)}</td>
                <td>{formatRSI(rsi3)}</td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
};

const SignalDisplay = ({ signals }) => {
  const sortedSignals = [...signals].sort((a, b) => {
    if (a.openTime > b.openTime) return -1;
    if (a.openTime < b.openTime) return 1;
    const timeFrameOrder = {'5m': 1, '15m': 2, '4h': 3};
    return timeFrameOrder[a.timeFrame] - timeFrameOrder[b.timeFrame];
  });

  return (
    <div className="signal-display">
      <h3>RSI Sinyalleri</h3>
      {sortedSignals.length > 0 ? (
        <table className="signal-table">
          <thead>
            <tr>
              <th>COIN NAME</th>
              <th>TIMEFRAME</th>
              <th>MA</th>
              <th>RSI 1 (7)</th>
              <th>RSI 2 (14)</th>
              <th>RSI 3 (21)</th>
              <th>SİNYAL</th>
            </tr>
          </thead>
          <tbody>
            {sortedSignals.map((signal, index) => (
              <tr key={index}>
                <td>{signal.coinName}</td>
                <td>{signal.timeFrame}</td>
                <td>{formatTime(signal.openTime)}</td>
                <td>{formatRSI(signal.rsi1)}</td>
                <td>{formatRSI(signal.rsi2)}</td>
                <td>{formatRSI(signal.rsi3)}</td>
                <td>{signal.rsi1 <= 30 ? 'Aşırı Satım' : 'Aşırı Alım'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Şu anda aktif sinyal bulunmamaktadır.</p>
      )}
    </div>
  );
};

const LiveRSI = () => {
  const [rsiData, setRsiData] = useState({});
  const [signals, setSignals] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState({});

  const checkForSignals = useCallback((symbol, rsiData, timeFrame) => {
    const { openTime, rsi1, rsi2, rsi3 } = rsiData;
    if ((rsi1 <= 60 && rsi2 <= 60 && rsi3 <= 60) || (rsi1 >= 70 && rsi2 >= 70 && rsi3 >= 70)) {
      setSignals(prevSignals => {
        const newSignal = { coinName: symbol.replace('USDT', ''), timeFrame, openTime, rsi1, rsi2, rsi3 };
        const existingSignalIndex = prevSignals.findIndex(
          s => s.coinName === newSignal.coinName && 
               s.timeFrame === newSignal.timeFrame && 
               s.openTime.getTime() === newSignal.openTime.getTime()
        );
        return existingSignalIndex !== -1
          ? prevSignals.map((s, i) => i === existingSignalIndex ? newSignal : s)
          : [...prevSignals, newSignal];
      });
    }
  }, []);

  const fetchData = useCallback(async (symbol, timeFrame, forceUpdate = false) => {
    const now = new Date();
    const lastUpdate = lastUpdateTime[`${symbol}-${timeFrame}`];
    
    const shouldUpdate = () => {
      if (forceUpdate) return true;
      if (!lastUpdate) return true;
      const timeDiff = now - lastUpdate;
      switch (timeFrame) {
        case '1m': return timeDiff >= 10000 || now.getSeconds() < 11; // 10 saniye veya yeni bir dakikanın ilk 10 saniyesi
        case '5m': return timeDiff >= 60000 || (now.getMinutes() % 5 === 0 && now.getSeconds() < 11);
        case '15m': return timeDiff >= 60000 || (now.getMinutes() % 15 === 0 && now.getSeconds() < 11);
        case '4h': return timeDiff >= 60000 || (now.getHours() % 4 === 0 && now.getMinutes() === 0 && now.getSeconds() < 11);
        default: return false;
      }
    };

    if (!shouldUpdate()) return;

    try {
      const klines = await fetchKlines(symbol, timeFrame, 501);
      const completedKlines = klines.slice(0, -1);
      const closePrices = completedKlines.map(kline => parseFloat(kline.closePrice));
      
      const rsi1 = calculateRSI(closePrices, 7);
      const rsi2 = calculateRSI(closePrices, 14);
      const rsi3 = calculateRSI(closePrices, 21);

      const lastTwoRSI = completedKlines.slice(-2).map((candle, index) => ({
        openTime: new Date(candle.openTime),
        closeTime: new Date(candle.closeTime),
        rsi1: rsi1[rsi1.length - 2 + index],
        rsi2: rsi2[rsi2.length - 2 + index],
        rsi3: rsi3[rsi3.length - 2 + index]
      })).reverse();

      checkForSignals(symbol, lastTwoRSI[0], timeFrame);

      setRsiData(prevData => ({
        ...prevData,
        [timeFrame]: {
          ...prevData[timeFrame],
          [symbol]: lastTwoRSI
        }
      }));

      setLastUpdateTime(prev => ({
        ...prev,
        [`${symbol}-${timeFrame}`]: now
      }));
    } catch (error) {
      console.error(`Veri çekme hatası (${symbol} ${timeFrame}):`, error);
    }
  }, [checkForSignals, lastUpdateTime]);

  useEffect(() => {
    const initialLoad = async () => {
      for (const timeFrame of TIME_FRAMES) {
        for (const coin of ALL_COINS) {
          await fetchData(coin, timeFrame, true);
        }
      }
    };

    initialLoad();

    const intervalId = setInterval(() => {
      TIME_FRAMES.forEach(timeFrame => {
        ALL_COINS.forEach(coin => fetchData(coin, timeFrame));
      });
    }, 1000); // Her saniye kontrol et

    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="live-rsi">
      {TIME_FRAMES.map(timeFrame => (
        <RSITable 
          key={timeFrame}
          timeFrame={timeFrame}
          rsiData={rsiData[timeFrame] || {}}
        />
      ))}
      <SignalDisplay signals={signals} />
    </div>
  );
};

export default LiveRSI;