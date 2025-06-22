import React, { useState } from 'react';
import HistoryTab from './HistoryTab';

const Chat = ({ setWindow, allScripts }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Weak search when input starts with "/"
    if (value.startsWith('/')) {
      const query = value.slice(1).toLowerCase();
      if (query.length > 0) {
        const results = allScripts.filter(script =>
          script.name.toLowerCase().includes(query)
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResponse((prev) => prev + '\n' + input);
      setLoading(false);
    }, 800);
    setInput('');
    setSearchResults([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1 w-full justify-center items-start">
        <div className={`flex flex-col items-center flex-1 transition-all duration-300 relative ${showHistory ? 'ml-0' : ''}`}> 
          <div className="w-3/5 max-w-xl relative">
            <button
              className="absolute right-4 top-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition z-30"
              onClick={() => setShowHistory((prev) => !prev)}>
              {showHistory ? 'Close History' : 'Open History'}
            </button>
            <div className="w-full h-15 flex flex-1 justify-center mb-6 mt-12">
                <button
                    className="w-20 h-full bg-blue-500 text-white justify-center hover:bg-blue-600 cursor-pointer"
                    onClick={(e) => setWindow('library')}>
                    LIB
                </button>
                <form onSubmit={handleSend} className="flex-1 h-full relative">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        className="w-full pl-5 h-full border border-gray-300 text-lg outline-none shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-200"
                        disabled={loading}
                    />
                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 shadow-lg z-20 max-h-48 overflow-y-auto">
                        {searchResults.map((script, idx) => (
                          <div key={idx} className="px-4 py-2 hover:bg-blue-100 cursor-pointer">
                            {script.name}
                          </div>
                        ))}
                      </div>
                    )}
                </form>
            </div>
            <div
              className="min-h-[200px] max-h-[400px] overflow-y-auto p-6 flex flex-col gap-4"
            >
              {response}
              {loading && (
                <div className="text-gray-400 italic">AI is typing...</div>
              )}
            </div>
          </div>
        </div>
        {
          <div className="mr-0 mt-0 h-full w-72 transition flex-shrink-0 flex-grow-0" style={ showHistory ? {} : {width: '0px' }}>
            <HistoryTab show={showHistory} onClose={() => setHistory([])} history={history} />
          </div>
        }
      </div>
    </div>
  );
};

export default Chat;