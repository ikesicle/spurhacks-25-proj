import React, { useState, useEffect } from 'react';
import ScriptView from './scriptview';

const Library = ({ setWindow, setCurrentScript }) => {
    const [counter, setCounter] = useState(0);
    const [scripts, setScripts] = useState([]);

    useEffect(() => {
        (async () => {
            var response = await fetch('http://localhost:8000/scripts/get_scripts', {
                method: 'GET'});
            if (response.ok) {
                var data = await response.json();
                console.log(data);
                setScripts(data);
            }

        })()}, []);

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex flex-1 w-full justify-center items-start">
                <div className="flex flex-col items-center flex-1 transition-all duration-300 relative">
                    <div className="w-3/5 max-w-xl relative">
                        <button
                            className="absolute right-4 top-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition z-30"
                            onClick={() => setWindow('chat')}>
                            Back to Chat
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Library</h2>
                        {scripts.length === 0 ? (
                            <div className="text-gray-400">No scripts available.</div>
                        ) : (
                            <ul className="list-disc">
                                {scripts.map((script, idx) => (
                                    <ScriptView scriptData={script} activateEdit={()=>{
                                        setCurrentScript(script);
                                        setWindow('edit');
                                    }} updateScript={()=>{setCounter(counter + 1)}} />
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Library;