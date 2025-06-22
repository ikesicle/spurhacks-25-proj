import React from 'react';

/**
 * ChatBlock component
 * @param {Object} props
 * @param {Object} props.data - The chat data, including .next.type and .next.content
 * @param {Function} [props.onToolSubmit] - Optional callback for tool prompt submission
 */
const ChatBlock = ({ data, submitData }) => {
  // If the AI chatbot calls a tool (type !== 'text'), show an interactive prompt
    const handleSubmit = async (e) => {
        e.preventDefault();
        var response = await fetch("http://localhost:8000/gemini/continue_session", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session: data.session, response: "" })
        });
        if (response.ok) {
            console.log("Script executed successfully");
            const responseData = await response.json();
            console.log(responseData)
            submitData(responseData.next.content);
        } else {
            console.error("Error executing script:", response.statusText);
        }
    };
  switch (data?.next?.type) {
    case 'execute_script':
    // Example: For demonstration, just show a simple input and submit button
        
        return (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-2">
            <div className="mb-2 font-semibold text-yellow-800">
            AI wants to execute the following script
            </div>
            <div className="mb-2 text-gray-700">
              {data.next.content.cmd_path} {data.next.content.args}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">OK</button>
            </form>
        </div>
        );
    case 'create_new_script':
    // Example: For demonstration, just show a simple input and submit button
        return (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-2">
            <div className="mb-2 font-semibold text-yellow-800">
            AI wants to create the following script
            </div>
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Enter script content here..."
              value={data.next.content.code || ''} />
            <form onSubmit={handleSubmit} className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">OK</button>
            </form>
        </div>
        );
    case 'ask':
    // Example: For demonstration, just show a simple input and submit button
        const [input, setInput] = React.useState('');
        const handleSubmitA = async (e) => {
            var response = fetch("http://localhost:8000/gemini/continue_session", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session: data.session, response: "" })
            })
            if (response.ok) {
                var data = await response.json();
                console.log(data);
                submitData(data.next.content);
            } else {
                console.error("Error executing script:", response.statusText);
            }
        }
        return (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-2">
            <div className="mb-2 font-semibold text-yellow-800">
            AI is requesting more information
            </div>
            value={data.next.content.prompt || ''}
            <input
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Enter response here"
              value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            <form onSubmit={handleSubmitA} className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">OK</button>
            </form>
        </div>
        );
  }
  // Otherwise, show a normal chat message
  return (
    <div className="p-4 bg-white rounded shadow mb-2">
      <div className="text-gray-800 whitespace-pre-line">{data?.next?.content?.text || ''}</div>
    </div>
  );
};

export default ChatBlock;
