import React from 'react';
import ReactDOM from 'react-dom/client';
import { Title, Body } from './title';

function App() {
  return(
    <div>
      <Title name="Mo" />
      <Body name="body"/>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);