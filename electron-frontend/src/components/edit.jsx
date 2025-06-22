import { data } from 'autoprefixer';
import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
const Edit = ({ setWindow, currentScript, updateScript }) => {

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onDragOver();
            window.electronAPI.onDrop((data) => {
                updateScript({...currentScript, path: data[0].path})
            });
        }

    }, []);

    return (
        <form className="h-screen w-screen p-5 flex-col flex">
            <div className="flex-1 w-full flex flex-row">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-4">
                        Edit Script: {currentScript ? currentScript.name : 'No Script Selected'}
                    </h2>
                    
                    <div>
                        id: {currentScript ? currentScript.id : 'N/A'}
                    </div>
                    <div className="mb-4">
                        <div className=''>
                            Script Name
                        </div>
                        <input
                            type="text"
                            value={currentScript ? currentScript.name : 'N/A'}
                            onChange={(e) => updateScript({ ...currentScript, name: e.target.value })}
                            placeholder="Script Name"
                            className="w-full mb-4 p-2 border border-gray-300 rounded shadow" />
                    </div>
                    <div className="mb-4">
                        <div className=''>
                            Description
                        </div>
                        <TextareaAutosize
                            type="text"
                            value={currentScript ? currentScript.description : 'N/A'}
                            onChange={(e) => updateScript({ ...currentScript, description: e.target.value })}
                            placeholder="Script Description"
                            className="w-full mb-4 p-2 border border-gray-300 rounded shadow" />
                    </div>
                    <div className="mb-4">
                        <div className=''>
                            Script Path
                        </div>
                        <TextareaAutosize
                            type="text"
                            value={currentScript ? currentScript.path : 'N/A'}
                            onChange={(e) => updateScript({ ...currentScript, path: e.target.value })}
                            placeholder="Script Path"
                            className="w-full mb-4 p-2 border border-gray-300 rounded shadow" />
                    </div>
                    <div className="mb-4">
                        <div className='w-full flex-row flex'>
                            <div>Parameters</div>
                            <button
                                type="button"
                                className="cursor-pointer ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                                onClick={() => {
                                    const newParam = { name: '', type: '' };
                                    updateScript({ ...currentScript, parameters: [...(currentScript.parameters || []), newParam] });
                                }}>
                                Add Parameter
                            </button>
                        </div>
                        {currentScript && currentScript.parameters && currentScript.parameters.map((param, idx) => {
                            return (
                                <div key={idx} className="mb-2 flex flex-row gap-2">
                                    <input
                                        type="text"
                                        value={param.name}
                                        onChange={(e) => {
                                            const updatedParams = [...currentScript.parameters];
                                            updatedParams[idx].name = e.target.value;
                                            updateScript({ ...currentScript, parameters: updatedParams });
                                        }}
                                        placeholder={`Parameter ${idx + 1} Name`}
                                        className="flex-1 p-2 border border-gray-300 rounded shadow"
                                        />
                                    <input
                                        type="text"
                                        value={param.type}
                                        onChange={(e) => {
                                            const updatedParams = [...currentScript.parameters];
                                            updatedParams[idx].type = e.target.value;
                                            updateScript({ ...currentScript, parameters: updatedParams });
                                        }}
                                        placeholder={`Parameter Type`}
                                        className="flex-1 p-2 border border-gray-300 rounded shadow" />
                                    <TextareaAutosize
                                        type="text"
                                        value={param.description}
                                        onChange={(e) => {
                                            const updatedParams = [...currentScript.parameters];
                                            updatedParams[idx].description = e.target.value;
                                            updateScript({ ...currentScript, parameters: updatedParams });
                                        }}
                                        placeholder={`Parameter Description`}
                                        className="flex-1 p-2 border border-gray-300 rounded shadow" />
                                    <button
                                        type="button"
                                        className=" px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                        onClick={() => {
                                            const updatedParams = currentScript.parameters.filter((_, i) => i !== idx);
                                            updateScript({ ...currentScript, parameters: updatedParams });
                                        }}>
                                        Delete
                                    </button>
                                </div>
                            );
                        })}
                    </div>


                </div>
            </div>
            <button
                type="button"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => {
                    (async () => {
                        fetch("http://localhost:8000/scripts/save_script", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(currentScript)
                        })
                    })()
                }}>
                Save Changes
            </button>
            <button
                type="button"
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={() => {
                    setWindow('library');
                }}>
                Return
            </button>
        </form>
    );
}

export default Edit;