/**
 * 🔍 Citation Demo - Example Implementation of Enhanced RAG Citations
 * 
 * This component demonstrates the complete citation system with mock data.
 */

import React, { useState } from 'react';
import { Citation, RAGDiscovery } from '../types/index';
import CitationRenderer from './CitationRenderer';
import HighlightedText from './HighlightedText';
import RAGDiscoveryPanel from './RAGDiscoveryPanel';
import { parseTextWithHighlighting } from '../utils/citationParser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Zap, Search, BookOpen } from 'lucide-react';

// Mock data for demonstration
const mockCitations: Citation[] = [
  {
    id: 'citation-1',
    source: 'Advanced RAG Techniques Whitepaper',
    type: 'document',
    content: 'Retrieval-Augmented Generation (RAG) combines the strengths of retrieval-based and generation-based approaches. By retrieving relevant information from a knowledge base and using it to augment the input to a language model, RAG can produce more factual and contextually appropriate responses.',
    relevance: 0.92,
    timestamp: new Date('2025-03-15'),
    documentId: 'doc-123',
    incantationUsed: 'semantic-search',
    highlightedText: 'Retrieval-Augmented Generation (RAG) combines the strengths of retrieval-based and generation-based approaches.',
    confidence: 0.88,
    quality: 0.9,
    page: 12
  },
  {
    id: 'citation-2',
    source: 'AI System Design Handbook',
    type: 'pdf',
    content: 'Incantation patterns represent structured prompt techniques that consistently produce better AI outputs. These patterns can be categorized as reasoning patterns (chain-of-thought, working backwards), creativity patterns (assumption-reversal), and structure patterns (pyramid principle).',
    relevance: 0.87,
    timestamp: new Date('2025-02-20'),
    documentId: 'doc-456',
    incantationUsed: 'chain-of-thought',
    highlightedText: 'Incantation patterns represent structured prompt techniques that consistently produce better AI outputs.',
    confidence: 0.85,
    quality: 0.86,
    page: 45
  },
  {
    id: 'citation-3',
    source: 'Research on Citation Quality Metrics',
    type: 'rag',
    content: 'Citation quality can be evaluated along multiple dimensions: relevance to the query, confidence score based on semantic similarity, and content quality metrics like coherence and informativeness. High-quality citations should score well across all these dimensions.',
    relevance: 0.79,
    timestamp: new Date('2025-01-05'),
    documentId: 'doc-789',
    incantationUsed: 'expert-persona',
    highlightedText: 'Citation quality can be evaluated along multiple dimensions: relevance to the query, confidence score based on semantic similarity, and content quality metrics.',
    confidence: 0.76,
    quality: 0.78,
    page: 8
  },
  {
    id: 'citation-4',
    source: 'Interactive AI Interfaces Guide',
    type: 'web',
    content: 'Interactive highlighting of source text provides users with immediate visual feedback on which parts of an AI response are grounded in retrieved documents. This transparency builds trust and allows users to evaluate the quality of AI-generated content.',
    relevance: 0.85,
    timestamp: new Date('2025-04-02'),
    documentId: 'web-123',
    incantationUsed: 'semantic-search',
    highlightedText: 'Interactive highlighting of source text provides users with immediate visual feedback on which parts of an AI response are grounded in retrieved documents.',
    confidence: 0.82,
    quality: 0.84,
    url: 'https://example.com/interactive-ai'
  },
  {
    id: 'citation-5',
    source: 'Best Practices for AI Transparency',
    type: 'document',
    content: 'Tracking the reasoning methods used to discover information is essential for AI transparency. By recording which prompt patterns (incantations) led to specific discoveries, users can understand not just what information was found, but how it was found, building trust in the AI system.',
    relevance: 0.88,
    timestamp: new Date('2025-03-28'),
    documentId: 'doc-321',
    incantationUsed: 'working-backwards',
    highlightedText: 'Tracking the reasoning methods used to discover information is essential for AI transparency.',
    confidence: 0.84,
    quality: 0.87,
    page: 23
  }
];

// Mock discoveries for demonstration
const mockDiscoveries: RAGDiscovery[] = [
  {
    query: 'How does RAG improve AI responses?',
    incantationUsed: 'semantic-search',
    timestamp: new Date('2025-04-10T14:32:00'),
    results: [mockCitations[0], mockCitations[3]],
    confidence: 0.9,
    context: 'User asked about RAG techniques'
  },
  {
    query: 'What are incantation patterns in AI?',
    incantationUsed: 'chain-of-thought',
    timestamp: new Date('2025-04-10T15:45:00'),
    results: [mockCitations[1], mockCitations[4]],
    confidence: 0.85,
    context: 'User asked about prompt engineering techniques'
  },
  {
    query: 'How can we evaluate citation quality?',
    incantationUsed: 'expert-persona',
    timestamp: new Date('2025-04-09T11:20:00'),
    results: [mockCitations[2]],
    confidence: 0.78,
    context: 'User asked about quality metrics for citations'
  },
  {
    query: 'Why is transparency important in AI systems?',
    incantationUsed: 'working-backwards',
    timestamp: new Date('2025-04-08T09:15:00'),
    results: [mockCitations[4], mockCitations[3]],
    confidence: 0.86,
    context: 'User asked about AI transparency'
  },
  {
    query: 'What if we reversed our assumptions about AI interfaces?',
    incantationUsed: 'assumption-reversal',
    timestamp: new Date('2025-04-07T16:30:00'),
    results: [
      {
        id: 'citation-6',
        source: 'Creative AI Design Principles',
        type: 'document',
        content: 'By reversing common assumptions about AI interfaces, we can discover innovative approaches. Instead of assuming AI should always provide answers, what if it primarily asked insightful questions? Rather than optimizing for speed, what if we optimized for depth of understanding?',
        relevance: 0.76,
        timestamp: new Date('2025-02-15'),
        documentId: 'doc-555',
        incantationUsed: 'assumption-reversal',
        highlightedText: 'By reversing common assumptions about AI interfaces, we can discover innovative approaches.',
        confidence: 0.72,
        quality: 0.75,
        page: 67
      }
    ],
    confidence: 0.75,
    context: 'User wanted creative approaches to AI design'
  }
];

// Example AI response with citations
const exampleResponse = `
Retrieval-Augmented Generation (RAG) combines the strengths of retrieval-based and generation-based approaches to produce more accurate AI responses. By incorporating relevant information from trusted sources, RAG systems can provide responses that are both contextually appropriate and factually grounded.

Incantation patterns represent structured prompt techniques that consistently produce better AI outputs. These patterns help guide the AI's reasoning process in specific ways, such as through step-by-step analysis or creative exploration of alternatives.

Interactive highlighting of source text provides users with immediate visual feedback on which parts of an AI response are grounded in retrieved documents. This transparency builds trust and allows users to evaluate the quality of the information.

Citation quality can be evaluated along multiple dimensions: relevance to the query, confidence score based on semantic similarity, and content quality metrics like coherence and informativeness.

Tracking the reasoning methods used to discover information is essential for AI transparency. By showing which prompt patterns led to specific discoveries, users gain insight into the AI's reasoning process.
`;

const CitationDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('highlighted');
  const [selectedDiscovery, setSelectedDiscovery] = useState<RAGDiscovery | null>(null);
  
  // Parse the example response to highlight citations
  const { segments, references } = parseTextWithHighlighting(exampleResponse, mockCitations, mockDiscoveries);
  
  const handleDiscoveryClick = (discovery: RAGDiscovery) => {
    setSelectedDiscovery(discovery);
    setActiveTab('discovery-detail');
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
          Enhanced RAG Citation System
        </h1>
        <p className="text-gray-600 mb-6">
          Interactive demonstration of the citation system with highlighting, tooltips, and discovery tracking.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="highlighted">
              <FileText className="w-4 h-4 mr-2" />
              Highlighted Text
            </TabsTrigger>
            <TabsTrigger value="citations">
              <BookOpen className="w-4 h-4 mr-2" />
              Citations
            </TabsTrigger>
            <TabsTrigger value="discoveries">
              <Zap className="w-4 h-4 mr-2" />
              Discoveries
            </TabsTrigger>
            {selectedDiscovery && (
              <TabsTrigger value="discovery-detail">
                <Search className="w-4 h-4 mr-2" />
                Discovery Detail
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="highlighted" className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">AI Response with Citation Highlighting</h2>
              <div className="prose prose-blue max-w-none">
                <HighlightedText
                  segments={segments}
                  citations={mockCitations}
                  discoveries={mockDiscoveries}
                  className="text-gray-800 leading-relaxed"
                />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <p>👆 Try clicking on the highlighted text to see citation details</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="citations" className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Citations</h2>
              <CitationRenderer
                citations={mockCitations}
                showRelevanceScores={true}
                showIncantations={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="discoveries" className="mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-3">RAG Discoveries</h2>
              <RAGDiscoveryPanel
                discoveries={mockDiscoveries}
                onDiscoveryClick={handleDiscoveryClick}
              />
            </div>
          </TabsContent>
          
          {selectedDiscovery && (
            <TabsContent value="discovery-detail" className="mt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Discovery Detail</h2>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {selectedDiscovery.incantationUsed.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Query</h3>
                  <p className="text-gray-800 bg-white border border-gray-200 rounded p-2 mt-1">
                    "{selectedDiscovery.query}"
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Found Sources</h3>
                  <div className="mt-2">
                    <CitationRenderer
                      citations={selectedDiscovery.results}
                      showRelevanceScores={true}
                      showIncantations={false}
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>Discovery made on {selectedDiscovery.timestamp.toLocaleString()}</p>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">About This Demo</h3>
          <p className="text-sm text-gray-600">
            This demonstration showcases the enhanced RAG citation system with interactive highlighting, 
            source attribution, and incantation tracking. The system provides transparency into how AI 
            discoveries are made and where information comes from.
          </p>
        </div>
      </div>
    </div>
  );
};

// Simple UI components for the demo
const Tabs = ({ value, onValueChange, children, className = '' }: any) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList || (child.type === TabsContent && child.props.value === value)) {
          return React.cloneElement(child, { activeTab: value, onTabChange: onValueChange });
        }
        return null;
      })}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange }: any) => {
  return (
    <div className="flex space-x-1 border-b border-gray-200">
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, { 
          active: child.props.value === activeTab,
          onClick: () => onTabChange(child.props.value)
        });
      })}
    </div>
  );
};

const TabsTrigger = ({ value, active, onClick, children }: any) => {
  return (
    <button
      className={`flex items-center px-4 py-2 text-sm font-medium ${
        active 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children }: any) => {
  return <div>{children}</div>;
};

export default CitationDemo; 