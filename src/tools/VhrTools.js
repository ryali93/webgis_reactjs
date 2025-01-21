import React, { useState } from 'react';
import { FaSlidersH } from 'react-icons/fa';

// import React, { useState } from 'react';
// import { FaCalendarAlt } from 'react-icons/fa';

// function InsarToolContent() {
//   const [date, setDate] = useState('');

//   const handleRun = () => {
//     console.log(`Running InSAR tool with date: ${date}`);
//   };

//   return (
//     <div>
//       <h4>InSAR Tool</h4>
//       <input
//         type="date"
//         value={date}
//         onChange={(e) => setDate(e.target.value)}
//       />
//       <button onClick={handleRun}>Run</button>
//     </div>
//   );
// }

// const InsarTools = {
//   label: 'InSAR',
//   icon: <FaCalendarAlt />,
//   content: InsarToolContent,
// };

// export default InsarTools;

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
  icon: <FaSlidersH />,
  content: VhrToolContent,
};

export default VhrTools;
