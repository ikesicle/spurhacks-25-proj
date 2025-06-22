import React, { useState } from 'react';
import ResultModal from './ResultModal';

const ScriptView = ({ scriptData, activateEdit, updateScript }) => {
    const [expanded, setExpanded] = useState(false);
    const [parameterValues, setParameterValues] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    const handleParamChange = (paramName, value) => {
        setParameterValues(prev => ({ ...prev, [paramName]: value }));
    };

    const handleRunScript = async () => {
        const args = scriptData.parameters.map(p => parameterValues[p.name] || "");

        try {
            const response = await fetch("http://localhost:8000/scripts/run_script", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script_id: scriptData._id, args: args })
            });
            const data = await response.json();
            setModalContent(data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to run script:", error);
            setModalContent({ detail: "An error occurred while trying to run the script." });
            setIsModalOpen(true);
        }
    };

    return (
        <>
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
                            <div className='space-y-3'>
                                {scriptData.parameters.map((param, idx) => (
                                    <div key={idx} className='grid grid-cols-2 gap-4 items-center'>
                                        <div className='text-gray-400'>
                                            <strong className="text-gray-300">{param.name}</strong> (<span className="text-cyan-400">{param.type}</span>): {param.description}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter argument..."
                                            value={parameterValues[param.name] || ''}
                                            onChange={(e) => handleParamChange(param.name, e.target.value)}
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">No parameters defined for this script.</p> }
                        
                        <div className='flex flex-row justify-end gap-3 mt-4'>
                            <button
                                title="Run"
                                className='py-2 px-4 font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200'
                                onClick={handleRunScript}>
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
            <ResultModal show={isModalOpen} onClose={() => setIsModalOpen(false)} resultData={modalContent} />
        </>
    );
}

export default ScriptView;