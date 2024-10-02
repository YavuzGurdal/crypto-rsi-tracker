import React from 'react';

const SignalDisplay = ({ rsi }) => {
  let signal = '';
  let color = '';

  if (rsi > 70) {
    signal = 'Aşırı Alım (Satış Sinyali)';
    color = 'red';
  } else if (rsi < 30) {
    signal = 'Aşırı Satım (Alım Sinyali)';
    color = 'green';
  } else {
    signal = 'Nötr';
    color = 'gray';
  }

  return (
    <div style={{ color: color }}>
      <h3>Sinyal: {signal}</h3>
    </div>
  );
};

export default SignalDisplay;
