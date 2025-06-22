import React, { useState, useEffect } from 'react';
import ScriptView from './scriptview';

const Library = ({ setWindow, setCurrentScript, allScripts, setAllScripts }) => {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        (async () => {
            var response = await fetch('http://localhost:8000/scripts/get_scripts', {method: 'GET'});
            if (response.ok) {
                var data = await response.json();
                setAllScripts(data);
            }

        })()}, [counter]);

    return (
        <div className="flex flex-col h-screen items-center overflow-y-auto p-8">
            <div className="w-full max-w-4xl">
                <div className="w-full flex flex-row items-center justify-between mb-8">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Script Library
                    </h1>
                    <div className="flex items-center gap-4">
                        <label htmlFor='file-select' className="cursor-pointer font-bold py-2 px-5 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                            Add From Disk
                        </label>
                        <input
                            type='file'
                            id="file-select"
                            className="hidden"
                            onChange={(e) => {
                                setCurrentScript({
                                    name: e.target.files[0].name,
                                    path: window.electronAPI.getFilePath(e.target.files[0]),
                                })
                                setWindow('edit')
                            }} />
                        <button
                            className="font-bold py-2 px-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            onClick={() => setWindow('chat')}>
                            Back to Chat
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4">
                    {allScripts.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No scripts available.</div>
                    ) : (
                            allScripts.map((script) => (
                                <ScriptView key={script._id} scriptData={script} activateEdit={()=>{
                                    setCurrentScript(script);
                                    setWindow('edit');
                                }} updateScript={()=>{setCounter(counter + 1)}} />
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Library;