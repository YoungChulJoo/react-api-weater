import './App.css';
import React, { useState } from 'react';
import WeatherInfo from './components/weatherInfo';

function App() {
  const [WeatherShow, setWeatherShow] = useState(true);
  return (
    <div className="App">
      {WeatherShow ? <WeatherInfo/>: null}
    </div>
  );
}

export default App;
