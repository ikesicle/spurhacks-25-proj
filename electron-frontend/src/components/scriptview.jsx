import React, { useState } from 'react';

const ScriptView = ({ scriptData, activateEdit, updateScript}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className='w-full flex flex-col bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg hover:border-indigo-500 transition-all duration-300'>
            <div className='w-full p-4 flex-row flex items-center'>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-lg font-semibold text-gray-100'>{scriptData.name}</h2>
                    <p className='text-sm text-gray-400'>{scriptData.description}</p>
                </div>
                <button
                    className='py-2 px-4 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors'
                    onClick={() => setExpanded(!expanded)}>{ expanded ? "Collapse" : "Expand"}</button>
            </div>
            { expanded && (
                <div className='bg-gray-900/70 p-4 rounded-b-xl border-t border-gray-700'>
                    <h3 className='text-md font-semibold mb-3 text-gray-200'>Parameters</h3>
                    {scriptData.parameters && scriptData.parameters.length > 0 ? (
                        <ul className='list-disc list-inside space-y-2 pl-2'>
                            {scriptData.parameters.map((param, idx) => (
                                <li key={idx} className='text-gray-400'>
                                    <strong className="text-gray-300">{param.name}</strong> (<span className="text-cyan-400">{param.type}</span>): {param.description}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">No parameters defined for this script.</p> }
                    
                    <div className='flex flex-row justify-end gap-3 mt-4'>
                        <button
                            title="Run"
                            className='py-2 px-4 font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                            onClick={() => alert(`Running script: ${scriptData.name}`)}>
                            Run
                        </button>
                        <button
                            title="Edit"
                            className='py-2 px-4 font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                            onClick={activateEdit}>
                            Edit
                        </button>
                        <button
                            title="Delete"
                            className='py-2 px-4 font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                            onClick={() => {
                                (async () => {
                                    await fetch(`http://localhost:8000/scripts/delete_script?_id=${scriptData._id}`, { method: "DELETE" });
                                    updateScript();
                                })();
                            }}>
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ScriptView;