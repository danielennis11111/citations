/**
 * 🎯 WORKING Citation Demo - Fully Self-Contained
 * 
 * This shows exactly how highlighted citations should work when the system is functioning properly.
 * No external APIs, no caching issues, just pure citation highlighting functionality.
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Eye, 
  EyeOff,
  Quote,
  ExternalLink,
  FileText,
  Globe
} from 'lucide-react';
import { Citation } from '../types/index';

// Working demo data that demonstrates the citation system
const DEMO_CITATIONS: Citation[] = [
  {
    id: 'demo-1',
    source: 'AI Research Paper 2024',
    type: 'pdf',
    content: 'Retrieval-Augmented Generation (RAG) systems combine information retrieval with language generation to provide more accurate and contextual responses. These systems have shown significant improvements in factual accuracy and reduced hallucinations.',
    relevance: 0.95,
    url: 'https://example.com/rag-paper-2024',
    timestamp: new Date('2024-03-15'),
    confidence: 0.92,
    quality: 0.89
  },
  {
    id: 'demo-2',
    source: 'Citation Systems Guide',
    type: 'web',
    content: 'Interactive highlighting allows users to see exactly which parts of an AI response are grounded in specific sources. This transparency builds trust and enables users to verify the information provided.',
    relevance: 0.91,
    url: 'https://example.com/citation-guide',
    timestamp: new Date('2024-02-20'),
    confidence: 0.87,
    quality: 0.85
  },
  {
    id: 'demo-3',
    source: 'Quality Metrics Handbook',
    type: 'document',
    content: 'Citation quality metrics include relevance scores, confidence levels, and source reliability ratings. High-quality citations should demonstrate clear connections between the source material and the generated response.',
    relevance: 0.88,
    url: 'https://example.com/quality-metrics',
    timestamp: new Date('2024-01-10'),
    confidence: 0.84,
    quality: 0.82
  }
];

// Create highlighted segments for demo purposes
const createHighlightedContent = () => {
  const segments = [
    {
      text: 'Retrieval-Augmented Generation (RAG) systems combine information retrieval with language generation to provide more accurate and contextual responses',
      isHighlighted: true,
      citationId: 'demo-1'
    },
    {
      text: '. These systems have shown significant improvements in factual accuracy and reduced hallucinations.\n\n',
      isHighlighted: false
    },
    {
      text: 'Interactive highlighting allows users to see exactly which parts of an AI response are grounded in specific sources',
      isHighlighted: true,
      citationId: 'demo-2'
    },
    {
      text: '. This transparency builds trust and enables users to verify the information provided.\n\n',
      isHighlighted: false
    },
    {
      text: 'Citation quality metrics include relevance scores, confidence levels, and source reliability ratings',
      isHighlighted: true,
      citationId: 'demo-3'
    },
    {
      text: '. High-quality citations should demonstrate clear connections between the source material and the generated response.\n\nThis demonstration shows how citations should work when the system is functioning properly.',
      isHighlighted: false
    }
  ];

  return segments;
};

// Inline Citation Card Component
const CitationCard: React.FC<{ citation: Citation }> = ({ citation }) => {
  const getTypeIcon = (type: Citation['type']) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getTypeIcon(citation.type)}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {citation.source}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
              <span className="capitalize">{citation.type}</span>
              <span className="text-blue-600 font-medium">
                {Math.round(citation.relevance * 100)}% relevance
              </span>
              <span>{citation.timestamp?.toLocaleDateString() || 'Unknown date'}</span>
            </div>
          </div>
        </div>
        
        {citation.url && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Open source"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      
      {/* Content */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <p>{citation.content}</p>
      </div>
      
      {/* Quality Metrics */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Relevance</span>
            <span className="font-medium">{Math.round(citation.relevance * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Quality</span>
            <span className="font-medium">{Math.round((citation.quality || 0) * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Confidence</span>
            <span className="font-medium">{Math.round((citation.confidence || 0) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CitationDemo: React.FC = () => {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  
  const contentSegments = createHighlightedContent();
  
  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
    if (citation.url) {
      window.open(citation.url, '_blank');
    }
  };

  const renderHighlightedContent = () => {
    return contentSegments.map((segment, index) => {
      if (segment.isHighlighted && segment.citationId) {
        const citation = DEMO_CITATIONS.find(c => c.id === segment.citationId);
        return (
          <span
            key={index}
            className="bg-blue-100 border-b-2 border-blue-400 cursor-pointer hover:bg-blue-200 transition-colors px-1 rounded"
            onClick={() => citation && handleCitationClick(citation)}
            title={`Source: ${citation?.source || 'Unknown'}`}
          >
            {segment.text}
          </span>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap">
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarVisible ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Quote className="w-7 h-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Working Citation Demo</h1>
                <p className="text-sm text-gray-600">Interactive highlighted citations • Fully functional demonstration</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              {sidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{sidebarVisible ? 'Hide' : 'Show'} Sources</span>
            </button>
          </div>
        </header>

        {/* Demo Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Quote className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">✅ Citations Working!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    This demonstrates the properly functioning citation system. Click on the highlighted text below to see sources.
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Response */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">AI Response with Working Citations</h3>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <div className="text-gray-800 leading-relaxed text-base">
                  <h4 className="text-lg font-semibold mb-3 text-gray-900">Understanding AI Citation Systems</h4>
                  <p className="mb-4">
                    {renderHighlightedContent()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{DEMO_CITATIONS.length} sources cited</span>
                  <span>Demo • No API calls required</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">How to use this demo:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click on any highlighted text to see the source citation</li>
                <li>• View all sources in the sidebar (toggle with the button above)</li>
                <li>• This shows exactly how citations should work when properly implemented</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Sources ({DEMO_CITATIONS.length})
                </h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Click on highlighted text to view sources</p>
            </div>

            {/* Citations List */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {DEMO_CITATIONS.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                <p>✨ Working citation demo</p>
                <p>No API dependencies • No caching issues</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationDemo; 