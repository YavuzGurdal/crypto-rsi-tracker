import React, { useState } from 'react';

const AlarmSettings = ({ onSetAlarm }) => {
  const [upperLimit, setUpperLimit] = useState(70);
  const [lowerLimit, setLowerLimit] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetAlarm({ upperLimit, lowerLimit });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Alarm Ayarları</h3>
      <div>
        <label>
          Üst Limit:
          <input 
            type="number" 
            value={upperLimit} 
            onChange={(e) => setUpperLimit(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Alt Limit:
          <input 
            type="number" 
            value={lowerLimit} 
            onChange={(e) => setLowerLimit(Number(e.target.value))}
          />
        </label>
      </div>
      <button type="submit">Apply</button>
    </form>
  );
};

export default AlarmSettings;
