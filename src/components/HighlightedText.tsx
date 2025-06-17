/**
 * 🔍 Highlighted Text Component - Interactive RAG Source Highlighting
 * 
 * Highlights text sourced from RAG with clickable citations that show
 * source details and the incantations used to discover the information.
 */

import React, { useState } from 'react';
import { FileText, Zap, BookOpen, Target, Calendar, ExternalLink, Info } from 'lucide-react';
import { HighlightedText as HighlightedTextType, Citation, RAGDiscovery } from '../types/index';

interface HighlightedTextProps {
  segments: HighlightedTextType[];
  citations: Citation[];
  discoveries: RAGDiscovery[];
  onCitationClick?: (citationId: string) => void;
  className?: string;
}

interface CitationTooltipProps {
  citation: Citation;
  discovery?: RAGDiscovery;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const _CitationTooltip: React.FC<CitationTooltipProps> = ({
  citation,
  discovery,
  isVisible,
  position,
  onClose
}) => {
  if (!isVisible) return null;

  // Format timestamp
  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown date';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get incantation display name
  const getIncantationName = (incantation?: string) => {
    if (!incantation) return 'Semantic Search';
    
    // Convert kebab-case to Title Case
    return incantation
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get incantation color class
  const getIncantationColor = (incantation?: string) => {
    const colors: Record<string, string> = {
      'semantic-search': 'bg-blue-50 text-blue-700 border-blue-200',
      'chain-of-thought': 'bg-purple-50 text-purple-700 border-purple-200',
      'expert-persona': 'bg-green-50 text-green-700 border-green-200',
      'working-backwards': 'bg-amber-50 text-amber-700 border-amber-200',
      'assumption-reversal': 'bg-pink-50 text-pink-700 border-pink-200'
    };
    
    return colors[incantation || 'semantic-search'] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div 
      className="fixed z-50 max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      style={{ 
        left: Math.min(position.x, window.innerWidth - 400),
        top: Math.max(position.y - 100, 10)
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{citation.source}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{Math.round(citation.relevance * 100)}% relevant</span>
              {citation.page && <span>Page {citation.page}</span>}
              <span>{formatDate(citation.timestamp)}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Content Preview */}
      <div className="text-sm text-gray-700 mb-3 border-l-2 border-gray-200 pl-3">
        <p className="line-clamp-3">
          {citation.excerpt || citation.highlightedText || citation.content.substring(0, 150)}
        </p>
      </div>

      {/* Incantation Used */}
      <div className={`border rounded p-2 mb-3 ${getIncantationColor(citation.incantationUsed)}`}>
        <div className="flex items-center space-x-1 mb-1">
          <Zap className="w-3 h-3" />
          <span className="text-xs font-medium">Discovered via {getIncantationName(citation.incantationUsed)}</span>
        </div>
        {discovery?.query && (
          <p className="text-xs italic">"{discovery.query}"</p>
        )}
      </div>

      {/* Quality Indicators */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex flex-col items-center p-1 bg-gray-50 rounded border border-gray-100">
          <span className="text-xs text-gray-500">Relevance</span>
          <div className="flex items-center mt-1">
            <Target className="w-3 h-3 text-blue-600 mr-1" />
            <span className="text-xs font-medium">{Math.round((citation.relevance || 0.5) * 100)}%</span>
          </div>
        </div>
        <div className="flex flex-col items-center p-1 bg-gray-50 rounded border border-gray-100">
          <span className="text-xs text-gray-500">Quality</span>
          <div className="flex items-center mt-1">
            <BookOpen className="w-3 h-3 text-green-600 mr-1" />
            <span className="text-xs font-medium">{Math.round((citation.quality || 0.5) * 100)}%</span>
          </div>
        </div>
        <div className="flex flex-col items-center p-1 bg-gray-50 rounded border border-gray-100">
          <span className="text-xs text-gray-500">Confidence</span>
          <div className="flex items-center mt-1">
            <Calendar className="w-3 h-3 text-purple-600 mr-1" />
            <span className="text-xs font-medium">{Math.round((citation.confidence || 0.5) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{citation.type === 'rag' ? 'Document' : citation.type}</span>
        </div>
        {citation.url && (
          <a 
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            View Source
          </a>
        )}
      </div>
    </div>
  );
};

const HighlightedText: React.FC<HighlightedTextProps> = ({
  segments,
  citations,
  discoveries,
  onCitationClick,
  className = ''
}) => {
  const [hoveredCitation, setHoveredCitation] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleCitationHover = (citationId: string, event: React.MouseEvent) => {
    setHoveredCitation(citationId);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleCitationClick = (citationId: string) => {
    if (onCitationClick) {
      onCitationClick(citationId);
    }
  };

  const getCitationById = (id: string): Citation | undefined => {
    return citations.find(c => c.id === id);
  };

  const getDiscoveryById = (id: string): RAGDiscovery | undefined => {
    return discoveries.find(d => d.results.some(r => r.id === id));
  };

  const renderTooltip = () => {
    if (!hoveredCitation) return null;

    const citation = getCitationById(hoveredCitation);
    if (!citation) return null;

    const discovery = getDiscoveryById(hoveredCitation);

    return (
      <div 
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm pointer-events-none"
        style={{ 
          left: tooltipPosition.x + 10, 
          top: tooltipPosition.y - 10,
          transform: 'translate(0, -100%)'
        }}
      >
        <div className="flex items-start space-x-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {citation.source}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="capitalize">{citation.type}</span>
              {citation.page && <span>Page {citation.page}</span>}
              <span className="text-green-600 font-medium">
                {Math.round(citation.relevance * 100)}% relevant
              </span>
            </div>
          </div>
          {citation.url && (
            <ExternalLink className="w-3 h-3 text-blue-600" />
          )}
        </div>
        
        <p className="text-xs text-gray-700 leading-relaxed mb-3">
          {citation.content.substring(0, 120)}
          {citation.content.length > 120 ? '...' : ''}
        </p>

        {discovery && (
          <div className="flex items-center space-x-1 text-xs text-purple-700 bg-purple-50 rounded px-2 py-1">
            <Zap className="w-3 h-3" />
            <span>
              Found via {discovery.incantationUsed.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          <Info className="w-3 h-3 inline mr-1" />
          Click to view details in sidebar
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {segments.map((segment, index) => {
        if (segment.isHighlighted && segment.citationId) {
          const citation = getCitationById(segment.citationId);
          if (!citation) return <span key={index}>{segment.text}</span>;

          return (
            <span
              key={index}
              className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors border-b-2 border-blue-300"
              onMouseEnter={(e) => handleCitationHover(segment.citationId!, e)}
              onMouseLeave={() => setHoveredCitation(null)}
              onClick={() => handleCitationClick(segment.citationId!)}
              title="Click to view source details"
            >
              {segment.text}
            </span>
          );
        }

        return <span key={index}>{segment.text}</span>;
      })}

      {renderTooltip()}
    </div>
  );
};

export default HighlightedText; 