import React, { useState } from 'react';
import { ImRoad } from "react-icons/im";

function VhrToolContent() {
  const [value, setValue] = useState('');

  const handleRun = () => {
    console.log(`Running VHR tool with value: ${value}`);
  };

  return (
    <div>
      <h4>Very High Resolution Tool</h4>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={handleRun}>Run VHR Tool</button>
    </div>
  );
}

const VhrTools = {
  label: 'VHR',
  icon: <ImRoad />,
  content: VhrToolContent,
};

export default VhrTools;
