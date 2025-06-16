import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConversationHub from './components/ConversationHub';
import CitationDemo from './components/CitationDemo';

function App() {
  return (
    <Router basename={process.env.NODE_ENV === 'production' ? '/rate-limiter' : ''}>
      <div className="App">
        <Routes>
          <Route path="/" element={<ConversationHub />} />
          <Route path="/citations" element={<CitationDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 