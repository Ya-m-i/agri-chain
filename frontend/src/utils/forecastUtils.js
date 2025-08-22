import ml5 from "ml5";

// Simple time series forecasting using ml5 NeuralNetwork
export async function forecastClaimsTimeSeries(data, forecastSteps = 4) {
  // data: [{x: '2023-Q1', y: 10}, ...]
  // Prepare training data
  const xs = data.map((d, i) => [i]);
  const ys = data.map(d => [d.y]);

  // Create and train the model
  const nn = ml5.neuralNetwork({ task: "regression", debug: false });
  xs.forEach((x, i) => nn.addData(x, ys[i]));
  await nn.normalizeData();
  await nn.train({ epochs: 100 });

  // Forecast next N steps
  const lastIndex = xs.length - 1;
  const forecast = [];
  for (let i = 1; i <= forecastSteps; i++) {
    const x = [lastIndex + i];
    const y = await nn.predict(x);
    forecast.push({ x: `Forecast+${i}`, y: Math.round(y[0].value) });
  }
  return forecast;
} 