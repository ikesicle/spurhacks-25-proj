import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
const Edit = ({ setWindow, currentScript, updateScript }) => {
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
                <div className=" w-1/2 ml-5">
                    <h2 className="text-lg font-semibold mb-4">
                        Script Code
                    </h2>
                    <TextareaAutosize
                        value={currentScript ? currentScript.code : ''}
                        onChange={(e) => {
                            updateScript({ ...currentScript, code: e.target.value });
                        }}
                        placeholder="Write your script code here..."
                        className="w-full h-96 p-2 border border-gray-300 rounded shadow"
                    />
                </div>
            </div>
            <button
                type="button"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                onClick={() => {
                    // TODO: Implement save functionality
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