import React from 'react';

const ResultModal = ({ show, onClose, resultData }) => {
    if (!show) {
        return null;
    }

    // Default message in case resultData is not as expected
    const defaultMessage = "No result data available.";

    const { message, return_code, stdout, stderr, detail } = resultData || {};

    const hasStdout = stdout && stdout.trim() !== '';
    const hasStderr = stderr && stderr.trim() !== '';

    return (
        <div 
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6">
                    Execution Result
                </h2>

                <div className="space-y-4 text-gray-300 max-h-[60vh] overflow-y-auto pr-4">
                    {detail ? (
                        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg">
                            <h3 className="font-bold text-red-300">Error</h3>
                            <p className="text-red-300">{detail}</p>
                        </div>
                    ) : (
                        <>
                            <p><strong className="font-semibold text-gray-400">Message:</strong> {message || defaultMessage}</p>
                            <p><strong className="font-semibold text-gray-400">Exit Code:</strong> <span className={return_code === 0 ? 'text-green-400' : 'text-red-400'}>{return_code}</span></p>

                            {hasStdout && (
                                <div className="pt-2">
                                    <h3 className="font-semibold text-gray-400 mb-1">STDOUT:</h3>
                                    <pre className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                                        {stdout}
                                    </pre>
                                </div>
                            )}

                            {hasStderr && (
                                <div className="pt-2">
                                    <h3 className="font-semibold text-red-400 mb-1">STDERR:</h3>
                                    <pre className="w-full p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-300 whitespace-pre-wrap">
                                        {stderr}
                                    </pre>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end mt-8">
                    <button
                        onClick={onClose}
                        className="font-bold py-2 px-6 text-white rounded-lg shadow-lg bg-indigo-600 hover:bg-indigo-500 transform hover:scale-105 transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultModal; 