import React, { useState, useEffect } from 'react';
import { fetchKlines } from '../services/binanceService';
import './LiveRSI.css';

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

const RSITable = ({ timeFrame, rsiData }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatRSI = (rsi) => {
    return typeof rsi === 'number' ? rsi.toFixed(2) : rsi;
  };

  const coinOrder = ['BTCUSDT', 'ETHUSDT'];

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
          {coinOrder.flatMap((coinName, coinIndex) => {
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
  // Sinyalleri MA ve TIMEFRAME'e göre sırala
  const sortedSignals = [...signals].sort((a, b) => {
    // Önce MA'ya göre sırala (en yeni en üstte)
    if (a.openTime > b.openTime) return -1;
    if (a.openTime < b.openTime) return 1;
    
    // MA aynıysa, TIMEFRAME'e göre sırala (küçükten büyüğe)
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
                <td>{signal.openTime.toLocaleTimeString()}</td>
                <td>{signal.rsi1.toFixed(2)}</td>
                <td>{signal.rsi2.toFixed(2)}</td>
                <td>{signal.rsi3.toFixed(2)}</td>
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

const LiveRSI = ({ timeFrames = ['1m', '5m', '15m', '4h'] }) => {
  const [rsiData, setRsiData] = useState({});
  const [signals, setSignals] = useState([]);
  const [rsi1mData, setRsi1mData] = useState({});
  const mainCoins = ['BTCUSDT', 'ETHUSDT'];
  const additionalCoins = [
    'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT', 'DOTUSDT',
    'UNIUSDT', 'BCHUSDT', 'LTCUSDT', 'LINKUSDT', 'MATICUSDT',
    'XLMUSDT', 'ETCUSDT', 'THETAUSDT', 'VETUSDT', 'FILUSDT',
    'TRXUSDT', 'EOSUSDT', 'AAVEUSDT', 'ATOMUSDT', 'NEOUSDT'
  ];
  const allCoins = [...mainCoins, ...additionalCoins];

  useEffect(() => {
    const fetchData = async (symbol, timeFrame) => {
      try {
        const klines = await fetchKlines(symbol, timeFrame, 501);
        const completedKlines = klines.slice(0, -1);
        const closePrices = completedKlines.map(kline => parseFloat(kline.closePrice));
        
        const rsi1Results = calculateRSI(closePrices, 7);
        const rsi2Results = calculateRSI(closePrices, 14);
        const rsi3Results = calculateRSI(closePrices, 21);

        const lastTwoRSI = completedKlines.slice(-2).map((candle, index) => ({
          openTime: new Date(candle.openTime),
          closeTime: new Date(candle.closeTime),
          rsi1: rsi1Results[rsi1Results.length - 2 + index],
          rsi2: rsi2Results[rsi2Results.length - 2 + index],
          rsi3: rsi3Results[rsi3Results.length - 2 + index]
        })).reverse();

        const lastRSI = lastTwoRSI[0];
        checkForSignals(symbol, lastRSI, timeFrame);

        if (mainCoins.includes(symbol)) {
          if (timeFrame === '1m') {
            setRsi1mData(prevData => ({
              ...prevData,
              [symbol]: lastTwoRSI
            }));
          } else {
            setRsiData(prevData => ({
              ...prevData,
              [timeFrame]: {
                ...prevData[timeFrame],
                [symbol]: lastTwoRSI
              }
            }));
          }
        }
      } catch (error) {
        console.error(`Veri çekme hatası (${symbol} ${timeFrame}):`, error);
      }
    };

    const checkForSignals = (symbol, rsiData, timeFrame) => {
      const { openTime, rsi1, rsi2, rsi3 } = rsiData;
      if ((rsi1 <= 30 && rsi2 <= 30 && rsi3 <= 30) || (rsi1 >= 70 && rsi2 >= 70 && rsi3 >= 70)) {
        setSignals(prevSignals => {
          const newSignal = {
            coinName: symbol.replace('USDT', ''),
            timeFrame,
            openTime,
            rsi1,
            rsi2,
            rsi3
          };
          
          const existingSignalIndex = prevSignals.findIndex(
            s => s.coinName === newSignal.coinName && 
                 s.timeFrame === newSignal.timeFrame && 
                 s.openTime.getTime() === newSignal.openTime.getTime()
          );

          if (existingSignalIndex !== -1) {
            const updatedSignals = [...prevSignals];
            updatedSignals[existingSignalIndex] = newSignal;
            return updatedSignals;
          } else {
            return [...prevSignals, newSignal];
          }
        });
      }
    };

    const updateData = () => {
      timeFrames.forEach(timeFrame => {
        allCoins.forEach(coin => fetchData(coin, timeFrame));
      });
    };

    updateData(); // İlk veri çekme
    const intervalId = setInterval(updateData, 60000); // Her dakika güncelle

    return () => clearInterval(intervalId);
  }, [timeFrames]);

  return (
    <div className="live-rsi">
      <SignalDisplay signals={signals} />
      <RSI1mTable rsiData={rsi1mData} />
      {timeFrames.map(timeFrame => (
        timeFrame !== '1m' && (
          <RSITable 
            key={timeFrame}
            timeFrame={timeFrame}
            rsiData={rsiData[timeFrame] || {}}
          />
        )
      ))}
    </div>
  );
};

const RSI1mTable = ({ rsiData }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatRSI = (rsi) => {
    return typeof rsi === 'number' ? rsi.toFixed(2) : rsi;
  };

  const coinOrder = ['BTCUSDT', 'ETHUSDT']; // Coin sıralamasını burada belirleyin

  return (
    <div className="rsi-table-container">
      <h3>1m RSI Değerleri</h3>
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
          {coinOrder.flatMap((coinName) => {
            const values = rsiData[coinName] || [];
            return values.map(({ openTime, closeTime, rsi1, rsi2, rsi3 }, index) => (
              <tr key={`${coinName}-${index}`}>
                <td>{coinName.replace('USDT', '')}</td>
                <td>{formatTime(new Date(openTime))}</td>
                <td>{formatTime(new Date(closeTime))}</td>
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

export default LiveRSI;