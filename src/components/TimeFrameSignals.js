import React from 'react';
import RSICalculator from './RSICalculator';

const TimeFrameSignals = ({ data, timeFrame }) => {
  const rsi = RSICalculator({ data }).props.children[1];
  const rsiValue = parseFloat(rsi);

  let signal = '';
  let color = '';

  if (rsiValue > 70) {
    signal = 'Aşırı Alım (Satış Sinyali)';
    color = 'red';
  } else if (rsiValue < 30) {
    signal = 'Aşırı Satım (Alım Sinyali)';
    color = 'green';
  } else {
    signal = 'Nötr';
    color = 'gray';
  }

  return (
    <div className="time-frame-signal">
      <h3>{timeFrame} RSI Sinyali</h3>
      <p>RSI Değeri: {rsiValue}</p>
      <p style={{ color: color }}>Sinyal: {signal}</p>
    </div>
  );
};

export default TimeFrameSignals;
