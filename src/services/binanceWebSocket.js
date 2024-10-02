let ws = null;

export const connectWebSocket = (symbol, callback) => {
  if (ws) {
    ws.close();
  }

  const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`;
  console.log(`Connecting to WebSocket: ${wsUrl}`);
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connection opened');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.e === 'kline') {
      const closePrice = parseFloat(data.k.c);
      console.log(`New price for ${symbol}: ${closePrice}`);
      callback(closePrice);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return () => {
    if (ws) {
      console.log('Closing WebSocket connection');
      ws.close();
    }
  };
};
