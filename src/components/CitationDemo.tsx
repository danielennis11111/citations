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
import { FileText, Zap, Search, BookOpen, Settings, Eye, EyeOff } from 'lucide-react';

// Mock data for demonstration with actual source URLs
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
    page: 12,
    url: 'https://arxiv.org/abs/2005.11401'
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
    page: 45,
    url: 'https://www.promptingguide.ai/techniques/cot'
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
    page: 8,
    url: 'https://aclanthology.org/2022.acl-long.83.pdf'
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
    url: 'https://github.com/microsoft/guidance'
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
    page: 23,
    url: 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback'
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
        page: 67,
        url: 'https://designguidelines.withgoogle.com/conversation/'
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
  const [activeTab, setActiveTab] = useState('citations');
  const [selectedDiscovery, setSelectedDiscovery] = useState<RAGDiscovery | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  // Parse the example response to highlight citations
  const { segments } = parseTextWithHighlighting(exampleResponse, mockCitations, mockDiscoveries);
  
  const handleDiscoveryClick = (discovery: RAGDiscovery) => {
    setSelectedDiscovery(discovery);
    setActiveTab('discovery-detail');
  };

  const handleCitationClick = (citationId: string) => {
    setActiveTab('citations');
    // Scroll to citation in sidebar if needed
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarVisible ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-7 h-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Enhanced RAG Citation System</h1>
                <p className="text-sm text-gray-600">Interactive demonstration with source verification</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Debug Mode Toggle */}
              <button
                onClick={() => setIsDebugMode(!isDebugMode)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDebugMode 
                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{isDebugMode ? 'Debug Mode' : 'Simple Mode'}</span>
              </button>
              
              {/* Sidebar Toggle */}
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                {sidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{sidebarVisible ? 'Hide' : 'Show'} Sources</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">AI Response with Source Attribution</h2>
                <div className="text-xs text-gray-500">
                  {mockCitations.length} sources • {mockDiscoveries.length} discoveries
                </div>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <HighlightedText
                  segments={segments}
                  citations={mockCitations}
                  discoveries={mockDiscoveries}
                  onCitationClick={handleCitationClick}
                  className="text-gray-800 leading-relaxed text-base"
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4 mt-0.5 text-blue-500" />
                  <p>
                    <strong>How it works:</strong> Click on any highlighted text to see source details in the sidebar. 
                    All information is grounded in verifiable sources with direct links to original materials.
                  </p>
                </div>
              </div>
            </div>

            {!isDebugMode && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">Want more details?</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Switch to Debug Mode to see confidence scores, discovery methods, and technical metadata.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="border-b border-gray-200 p-4">
              <SimpleTabs value={activeTab} onValueChange={setActiveTab}>
                <SimpleTabsList>
                  <SimpleTabsTrigger value="citations">
                    <BookOpen className="w-4 h-4 mr-1.5" />
                    Sources
                  </SimpleTabsTrigger>
                  <SimpleTabsTrigger value="discoveries">
                    <Zap className="w-4 h-4 mr-1.5" />
                    Research
                  </SimpleTabsTrigger>
                  {selectedDiscovery && (
                    <SimpleTabsTrigger value="discovery-detail">
                      <Search className="w-4 h-4 mr-1.5" />
                      Detail
                    </SimpleTabsTrigger>
                  )}
                </SimpleTabsList>
              </SimpleTabs>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-auto p-4">
              <SimpleTabsContent value="citations">
                <div className="space-y-4">
                  <div className="text-xs text-gray-500 mb-3">
                    {mockCitations.length} sources found • Click to view original
                  </div>
                  <CitationRenderer
                    citations={mockCitations}
                    showRelevanceScores={isDebugMode}
                    showIncantations={isDebugMode}
                    maxPreviewLength={isDebugMode ? 200 : 120}
                    className="space-y-3"
                  />
                </div>
              </SimpleTabsContent>
              
              <SimpleTabsContent value="discoveries">
                <div className="space-y-4">
                  <div className="text-xs text-gray-500 mb-3">
                    Research discoveries • {isDebugMode ? 'Debug view' : 'Simplified view'}
                  </div>
                  <RAGDiscoveryPanel
                    discoveries={mockDiscoveries}
                    onDiscoveryClick={handleDiscoveryClick}
                    className="space-y-3"
                  />
                </div>
              </SimpleTabsContent>
              
              {selectedDiscovery && (
                <SimpleTabsContent value="discovery-detail">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Discovery Analysis</h3>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {selectedDiscovery.incantationUsed.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Research Query</h4>
                      <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded p-3">
                        "{selectedDiscovery.query}"
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Sources Found</h4>
                      <CitationRenderer
                        citations={selectedDiscovery.results}
                        showRelevanceScores={isDebugMode}
                        showIncantations={false}
                        maxPreviewLength={100}
                      />
                    </div>
                    
                    {isDebugMode && (
                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Debug Information</h4>
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="font-medium">{Math.round(selectedDiscovery.confidence * 100)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sources:</span>
                            <span className="font-medium">{selectedDiscovery.results.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Timestamp:</span>
                            <span className="font-medium">{selectedDiscovery.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </SimpleTabsContent>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple UI components for the demo
const SimpleTabs = ({ value, onValueChange, children, className = '' }: any) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        
        if (child.type === SimpleTabsList || (child.type === SimpleTabsContent && child.props.value === value)) {
          return React.cloneElement(child, { activeTab: value, onTabChange: onValueChange });
        }
        return null;
      })}
    </div>
  );
};

const SimpleTabsList = ({ children, activeTab, onTabChange }: any) => {
  return (
    <div className="flex space-x-1">
      {React.Children.map(children, (child) => {
        if (!child) return null;
        
        return React.cloneElement(child, { 
          active: child.props.value === activeTab,
          onClick: () => onTabChange(child.props.value)
        });
      })}
    </div>
  );
};

const SimpleTabsTrigger = ({ value, active, onClick, children }: any) => {
  return (
    <button
      className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        active 
          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const SimpleTabsContent = ({ value, children }: any) => {
  return <div>{children}</div>;
};

export default CitationDemo; 