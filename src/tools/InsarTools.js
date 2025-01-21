import React, { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

function InsarToolContent() {
  const [date, setDate] = useState('');

  const handleRun = () => {
    console.log(`Running InSAR tool with date: ${date}`);
  };

  return (
    <div>
      <h4>InSAR Tool</h4>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleRun}>Run</button>
    </div>
  );
}

const InsarTools = {
  label: 'InSAR',
  icon: <FaCalendarAlt />,
  content: InsarToolContent,
};

export default InsarTools;
