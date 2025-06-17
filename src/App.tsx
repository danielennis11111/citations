import React from 'react';
import CitationDemo from './components/CitationDemo';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Enhanced Citation Demo</h1>
          <p className="text-gray-600">Interactive demonstration of RAG citations</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <CitationDemo />
      </main>
    </div>
  );
}

export default App; 