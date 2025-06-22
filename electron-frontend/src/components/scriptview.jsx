import React, { useState } from 'react';

const ScriptView = ({visible, scriptData, activateEdit, updateScript}) => {
    const [expanded, setExpanded] = useState(false);
    const [parameters, setParameters] = useState({});
    return (
        <div className='w-full flex flex-col'>
            <div className='w-full h-20 flex-row flex bg-gray-200'>
                <div className='flex flex-col flex-1'>
                    <h2 className='text-lg font-semibold'>{scriptData.name}</h2>
                    <p className='text-gray-600'>{scriptData.description}</p>
                </div>
                <button
                    className='h-20 w-20 bg-blue-500 text-white rounded hover:bg-blue-600 transition'
                    onClick={() => setExpanded(!expanded)}>{ expanded ? "COLPS" : "EXPND"}</button>
            </div>
            { expanded && (<div> { /* Dropdown menu */ }
                <div className='bg-gray-100 p-4 rounded mt-2'>
                    <h3 className='text-md font-semibold mb-2'>Parameters</h3>
                    <form>
                        <ul className='list-disc pl-5'>
                            {scriptData.parameters.map((param, idx) => (
                                <li key={idx} className='text-gray-700'>
                                    <strong>{param.name}</strong> ({param.type}):
                                    <input
                                        type="text"
                                        className="w-auto ml-2 pl-1 h-full border border-gray-300 text-lg outline-none shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-200"
                                    />
                                </li>
                            ))}
                        </ul>
                    </form>
                </div>
                <div className='flex flex-row justify-center'>
                    <button
                        className='h-10 w-20 bg-green-500 text-white rounded hover:bg-green-600 transition mr-2'
                        onClick={() => alert(`Running script: ${scriptData.name}`)}>
                        Run
                    </button>
                    <button
                        className='h-10 w-20 bg-red-500 text-white rounded hover:bg-red-600 transition mr-2'
                        onClick={() => {
                            (async () => {
                                await fetch(`http://localhost:8000/scripts/delete_script?_id=${scriptData._id}`,
                                    {
                                        method: "DELETE"
                                    }
                                )
                                console.log("Deleted.")
                                updateScript()
                            })()
                        }}>
                        Delete
                    </button>
                    <button
                        className='h-10 w-20 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition'
                        onClick={() => {activateEdit();}}>
                        Edit
                    </button>
                </div>
            </div>)}
        </div>
    );
}

export default ScriptView;