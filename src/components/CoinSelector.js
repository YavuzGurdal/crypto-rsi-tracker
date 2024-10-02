import React from 'react';

const CoinSelector = ({ coins, selectedCoin, onSelectCoin }) => {
  return (
    <select value={selectedCoin} onChange={(e) => onSelectCoin(e.target.value)}>
      {coins.map(coin => (
        <option key={coin} value={coin}>{coin}</option>
      ))}
    </select>
  );
};

export default CoinSelector;
