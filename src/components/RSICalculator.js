import React from 'react';

export const calculateRSI = (closePrices, period = 14) => {
  if (closePrices.length <= period) {
    console.log('Yetersiz veri: RSI hesaplaması için en az', period + 1, 'veri noktası gerekli');
    return 'Yetersiz veri';
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

  // İlk RSI değerini hesapla
  let rs = avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));

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

    // Ortalama kazanç ve kayıpları güncelle
    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

    // RSI'yı güncelle
    rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }

  return rsi;
};

const RSICalculator = ({ data }) => {
  const rsi = calculateRSI(data);
  return (
    <div>
      <h2>RSI Değeri: {rsi}</h2>
    </div>
  );
};

export default RSICalculator;
