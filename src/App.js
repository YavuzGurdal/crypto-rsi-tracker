import React from 'react';
import LiveRSI from './components/LiveRSI';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2>Kripto Para RSI Göstergesi</h2>
      </header>
      <main className="App-main">
        <LiveRSI symbol="BTCUSDT" timeFrames={['5m', '15m', '4h']} />
      </main>
    </div>
  );
}

export default App;
