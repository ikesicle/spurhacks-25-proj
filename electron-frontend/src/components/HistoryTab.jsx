import React from 'react';

const HistoryTab = ({ show, clear, history }) => {
  if (!show) return null;
  return (
    <div className="h-full w-full bg-white rounded-xl shadow-lg p-4 flex flex-col gap-3 border border-gray-200">
      <div className="font-semibold text-lg mb-2 flex justify-between items-center">
        <span>History</span>
        <button onClick={clear} className="ml-2 text-sm text-blue-500 hover:underline">Clear</button>
      </div>
      {history.length === 0 && <div className="text-gray-400">No history yet.</div>}
      {history.map((item, idx) => (
        <div key={idx} className="bg-gray-100 rounded p-3 text-gray-700 shadow-sm">
          {item}
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
