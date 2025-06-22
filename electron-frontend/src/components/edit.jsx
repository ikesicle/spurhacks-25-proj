import { data } from 'autoprefixer';
import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const FormSection = ({ title, children }) => (
    <div className="mb-6">
        <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{title}</label>
        {children}
    </div>
);

const Edit = ({ setWindow, currentScript, updateScript }) => {

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onDragOver();
            window.electronAPI.onDrop((data) => {
                updateScript({...currentScript, path: data[0].path})
            });
        }
    }, []);

    const inputClasses = "w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-colors";
    const buttonClasses = "font-bold py-2 px-5 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200";

    return (
        <div className="h-screen w-screen p-8 flex justify-center items-center">
            <form className="w-full max-w-4xl h-full flex-col flex bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex-1 overflow-y-auto pr-4">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6">
                        {currentScript && currentScript.id ? 'Edit Script' : 'Create New Script'}
                    </h1>
                    
                    <FormSection title="Script Name">
                        <input
                            type="text"
                            value={currentScript ? currentScript.name : ''}
                            onChange={(e) => updateScript({ ...currentScript, name: e.target.value })}
                            placeholder="Enter script name"
                            className={inputClasses} />
                    </FormSection>
                    
                    <FormSection title="Description">
                        <TextareaAutosize
                            minRows={2}
                            value={currentScript ? currentScript.description : ''}
                            onChange={(e) => updateScript({ ...currentScript, description: e.target.value })}
                            placeholder="Describe what this script does"
                            className={inputClasses} />
                    </FormSection>

                    <FormSection title="Script Path">
                        <TextareaAutosize
                            minRows={1}
                            value={currentScript ? currentScript.path : ''}
                            onChange={(e) => updateScript({ ...currentScript, path: e.target.value })}
                            placeholder="Drag a file here or enter path manually"
                            className={inputClasses} />
                    </FormSection>

                    <div className="mb-4">
                        <div className='w-full flex-row flex items-center mb-3'>
                            <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider">Parameters</label>
                            <button
                                type="button"
                                className="ml-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                                onClick={() => {
                                    const newParam = { name: '', type: '', description: '' };
                                    updateScript({ ...currentScript, parameters: [...(currentScript.parameters || []), newParam] });
                                }}>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Add Parameter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {currentScript && currentScript.parameters && currentScript.parameters.map((param, idx) => {
                                return (
                                    <div key={idx} className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg flex flex-row items-center gap-3">
                                        <input
                                            type="text"
                                            value={param.name}
                                            onChange={(e) => {
                                                const updatedParams = [...currentScript.parameters];
                                                updatedParams[idx].name = e.target.value;
                                                updateScript({ ...currentScript, parameters: updatedParams });
                                            }}
                                            placeholder={`Name`}
                                            className="flex-1 p-2 bg-gray-700 border-gray-600 rounded text-gray-200"
                                            />
                                        <input
                                            type="text"
                                            value={param.type}
                                            onChange={(e) => {
                                                const updatedParams = [...currentScript.parameters];
                                                updatedParams[idx].type = e.target.value;
                                                updateScript({ ...currentScript, parameters: updatedParams });
                                            }}
                                            placeholder={`Type`}
                                            className="flex-1 p-2 bg-gray-700 border-gray-600 rounded text-gray-200" />
                                        <TextareaAutosize
                                            minRows={1}
                                            value={param.description}
                                            onChange={(e) => {
                                                const updatedParams = [...currentScript.parameters];
                                                updatedParams[idx].description = e.target.value;
                                                updateScript({ ...currentScript, parameters: updatedParams });
                                            }}
                                            placeholder={`Description`}
                                            className="flex-grow p-2 bg-gray-700 border-gray-600 rounded text-gray-200" />
                                        <button
                                            type="button"
                                            className="p-2 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600 hover:text-gray-300 transition-colors"
                                            onClick={() => {
                                                const updatedParams = currentScript.parameters.filter((_, i) => i !== idx);
                                                updateScript({ ...currentScript, parameters: updatedParams });
                                            }}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-700">
                    <button
                        type="button"
                        className={`${buttonClasses} bg-gray-600 hover:bg-gray-500 flex items-center gap-2`}
                        onClick={() => setWindow('library')}>
                        <FontAwesomeIcon icon={faTimes} />
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`${buttonClasses} bg-gradient-to-r from-green-500 to-teal-500 flex items-center gap-2`}
                        onClick={() => {
                            (async () => {
                                await fetch("http://localhost:8000/scripts/save_script", {
                                    method: "POST",
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({...{ name: "", description: "", path: "", parameters: [] }, ...currentScript})
                                });
                                setWindow('library');
                            })();
                        }}>
                        <FontAwesomeIcon icon={faSave} />
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Edit;