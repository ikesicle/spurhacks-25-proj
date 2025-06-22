import React from 'react';

const HistoryTab = ({ show, clear, history }) => {
  if (!show) return null;
  return (
    <div className="h-full w-full bg-gray-800/30 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-gray-700">
      <div className="font-semibold text-lg flex justify-between items-center text-gray-100">
        <span>History</span>
        <button onClick={clear} className="ml-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
          Clear
        </button>
      </div>
      <div className="overflow-y-auto pr-2 flex flex-col gap-3">
        {history.length === 0 && <div className="text-gray-500 text-center py-4">No history yet.</div>}
        {history.map((item, idx) => (
          <div key={idx} className="bg-gray-900/50 rounded-lg p-3 text-gray-300 shadow-md border border-gray-700">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTab;
