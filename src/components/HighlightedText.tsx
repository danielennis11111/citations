/**
 * ✨ Enhanced Highlighted Text Component with Citation Interaction
 * 
 * Renders text with interactive highlighting for citations.
 * Supports click handlers for sidebar navigation and improved UX.
 */

import React, { useState } from 'react';
import { ExternalLink, Info, BookOpen } from 'lucide-react';
import { HighlightedText as HighlightedTextType, Citation, SourceDiscovery } from '../types/index';

interface HighlightedTextProps {
  segments: HighlightedTextType[];
  citations: Citation[];
  discoveries: SourceDiscovery[];
  onCitationClick?: (citationId: string) => void;
  className?: string;
}

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

  const renderTooltip = () => {
    if (!hoveredCitation) return null;

    const citation = getCitationById(hoveredCitation);
    if (!citation) return null;

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