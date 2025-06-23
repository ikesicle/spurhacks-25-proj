import React from 'react';
import ReactDOM from 'react-dom/client';
import Chat from './chat';
import Library from './library'; // Placeholder for library component
import Edit from './edit'; // Placeholder for edit component
import '../index.css'; // Import the new CSS file

const App = () => {
  const [window, setWindow] = React.useState('chat');
  const [currentScript, setCurrentScript] = React.useState(null);
  const [allScripts, setAllScripts] = React.useState([]);
  return(
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-black text-gray-300 font-sans">
      {(() => {
        switch (window) {
          case 'chat':
            return <Chat setWindow={setWindow} allScripts={allScripts} />;
          case 'library':
            return <Library setWindow={setWindow} setCurrentScript={setCurrentScript} allScripts={allScripts} setAllScripts={setAllScripts}/>; // Placeholder for library component
          case 'edit':
            return <Edit setWindow={setWindow} currentScript={currentScript} updateScript={setCurrentScript}/>;
          default:
            return <Chat setWindow={setWindow} />;
        }
      })()}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);