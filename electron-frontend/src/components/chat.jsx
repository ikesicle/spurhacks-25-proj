import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import HistoryTab from './HistoryTab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faBook, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const Chat = ({ setWindow }) => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [history]);

    const handleSendMessage = async () => {
        if (!message.trim() || isThinking) return;

        const newMessage = { type: 'user', content: message };
        setHistory(prev => [...prev, newMessage]);
        setMessage('');
        setIsThinking(true);

        try {
            const response = await fetch("http://localhost:8000/gemini/send_message", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await response.json();
            console.log(data);
            
            let botResponse = { type: 'bot', content: "Sorry, I couldn't process that." };

            if (data.next && data.next.type === "confirmation_required") {
                const { cmd_path, args } = data.next.content;
                botResponse = {
                    type: 'bot',
                    content: `I am about to execute the following command:\n\n'${cmd_path} ${args.join(" ")}'\n\nPlease confirm if you'd like to proceed.`,
                    requiresConfirmation: true,
                    session: data.session
                };
            } else if (data.next && data.next.content && data.next.content.text) {
                botResponse.content = data.next.content.text;
            } else if (data.function_called) {
                botResponse.content = `Function Call: ${data.function_called}\nArgs: ${JSON.stringify(data.function_args, null, 2)}\nResult: ${JSON.stringify(data.function_result, null, 2)}`;
            } else if (data.next?.content?.return) {
                const { returncode, stdout, stderr } = data.next.content.return;
                let resultText = `Execution Finished with Exit Code: ${returncode}`;
                if (stdout) {
                    resultText += `\n\nSTDOUT:\n${stdout}`;
                }
                if (stderr) {
                    resultText += `\n\nSTDERR:\n${stderr}`;
                }
                if (!stdout && !stderr) {
                    resultText += `\n(No output to STDOUT or STDERR)`;
                }
                botResponse.content = resultText;
            }

            setHistory(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setHistory(prev => [...prev, { type: 'bot', content: "An error occurred while connecting to the server." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleConfirmation = async (session, confirmed) => {
        // Find the confirmation message in history and mark it as resolved
        setHistory(prev => prev.map(item => 
            item.session === session ? { ...item, requiresConfirmation: false, confirmed: confirmed } : item
        ));
        
        if (!confirmed) {
            setHistory(prev => [...prev, { type: 'bot', content: "Action Cancelled." }]);
            return;
        }

        setIsThinking(true);
        console.log(session)
        try {
            const response = await fetch("http://localhost:8000/gemini/continue_session", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session: session, response: "Yes" })
            });
            const data = await response.json();
            console.log(data)
            
            // Add the new response from the continued session
            let botResponse = { type: 'bot', content: "Couldn't process the next step." };
             if (data.next && data.next.content && data.next.content.text) {
                botResponse.content = data.next.content.text;
            } else if (data.function_called) {
                botResponse.content = `Function Call: ${data.function_called}\nArgs: ${JSON.stringify(data.function_args, null, 2)}\nResult: ${JSON.stringify(data.function_result, null, 2)}`;
            }
            setHistory(prev => [...prev, botResponse]);

        } catch (error) {
            console.error("Failed to continue session:", error);
            setHistory(prev => [...prev, { type: 'bot', content: "An error occurred during confirmation." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const ConfirmationButtons = ({ msg }) => {
        if (!msg.requiresConfirmation) return null;
        return (
            <div className="flex justify-end gap-3 mt-3">
                <button 
                    className="flex items-center gap-2 py-2 px-4 font-semibold bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg"
                    onClick={() => handleConfirmation(msg.session, false)}>
                    <FontAwesomeIcon icon={faTimes} /> No
                </button>
                <button 
                    className="flex items-center gap-2 py-2 px-4 font-semibold bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg shadow-md hover:shadow-lg"
                    onClick={() => handleConfirmation(msg.session, true)}>
                    <FontAwesomeIcon icon={faCheck} /> Yes
                </button>
            </div>
        );
    };

    return (
        <div className="h-full w-full flex p-8 gap-8">
            <div className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-6">
                <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                    {history.map((item, idx) => (
                        <div key={idx} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${item.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                <pre className="whitespace-pre-wrap font-sans">{item.content}</pre>
                                <ConfirmationButtons msg={item} />
                            </div>
                        </div>
                    ))}
                    {isThinking && (
                        <div className="flex justify-start">
                            <div className="px-5 py-3 rounded-2xl shadow-md bg-gray-800 text-gray-400">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-6 flex items-center gap-4">
                    <TextareaAutosize
                        maxRows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (handleSendMessage(), e.preventDefault())}
                        placeholder="Type your message..."
                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-colors"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isThinking}
                        className="font-bold py-3 px-6 text-white rounded-lg shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faPaperPlane} />
                        Send
                    </button>
                    <button
                        onClick={() => setWindow('library')}
                        className="font-bold py-3 px-6 text-white rounded-lg shadow-lg bg-gray-600 hover:bg-gray-500 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faBook} />
                        Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;