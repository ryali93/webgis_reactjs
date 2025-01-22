import React, { useState } from 'react';
import { MdOutlineTimeline } from "react-icons/md";

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
  icon: <MdOutlineTimeline />,
  content: InsarToolContent,
};

export default InsarTools;
