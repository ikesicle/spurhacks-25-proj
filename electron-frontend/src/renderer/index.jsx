import React from 'react';
import ReactDOM from 'react-dom/client';
import { Title, Body } from './components/title';

function App() {
  return(
    <div>
      <Title name="Mo" />
      <Body />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
