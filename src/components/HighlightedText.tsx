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
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm cursor-pointer hover:shadow-2xl transition-shadow"
        style={{ 
          left: tooltipPosition.x + 10, 
          top: tooltipPosition.y - 10,
          transform: 'translate(0, -100%)'
        }}
        onClick={() => {
          // Make tooltip clickable - open source or trigger sidebar
          if (citation.url) {
            window.open(citation.url, '_blank');
          }
          handleCitationClick(hoveredCitation);
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

        <div className="mt-2 text-xs text-blue-600 font-medium flex items-center">
          <Info className="w-3 h-3 inline mr-1" />
          Click to open source or view details
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {segments.map((segment, index) => {
        if (segment.isHighlighted && segment.citationId) {
          const citation = getCitationById(segment.citationId);
          if (!citation) return <span key={index}>{renderFormattedText(segment.text)}</span>;

          return (
            <span
              key={index}
              className="bg-blue-100 text-blue-900 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-200 transition-colors border-b-2 border-blue-300"
              onMouseEnter={(e) => handleCitationHover(segment.citationId!, e)}
              onMouseLeave={() => setHoveredCitation(null)}
              onClick={() => handleCitationClick(segment.citationId!)}
              title="Click to view source details"
            >
              {renderFormattedText(segment.text)}
            </span>
          );
        }

        return <span key={index}>{renderFormattedText(segment.text)}</span>;
      })}

      {renderTooltip()}
    </div>
  );
};

/**
 * Render text with markdown formatting support
 */
function renderFormattedText(text: string): React.ReactNode {
  // Handle bold text **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let match;
  let keyIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(renderItalicText(beforeText, keyIndex++));
    }
    
    // Add bold text
    parts.push(
      <strong key={`bold-${keyIndex++}`} className="font-semibold text-gray-900">
        {renderItalicText(match[1], keyIndex++)}
      </strong>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(renderItalicText(remainingText, keyIndex++));
  }
  
  return parts.length > 1 ? <>{parts}</> : renderItalicText(text, 0);
}

/**
 * Render text with italic formatting support
 */
function renderItalicText(text: string, startKey: number): React.ReactNode {
  const italicRegex = /\*(.*?)\*/g;
  let lastIndex = 0;
  const parts: React.ReactNode[] = [];
  let match;
  let keyIndex = startKey;

  while ((match = italicRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      parts.push(renderLineBreaks(beforeText, keyIndex++));
    }
    
    // Add italic text
    parts.push(
      <em key={`italic-${keyIndex++}`} className="italic text-gray-800">
        {renderLineBreaks(match[1], keyIndex++)}
      </em>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(renderLineBreaks(remainingText, keyIndex++));
  }
  
  return parts.length > 1 ? <>{parts}</> : renderLineBreaks(text, 0);
}

/**
 * Render line breaks and basic text formatting
 */
function renderLineBreaks(text: string, key: number): React.ReactNode {
  const lines = text.split('\n');
  if (lines.length === 1) return text;
  
  return lines.map((line, index) => (
    <React.Fragment key={`line-${key}-${index}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

export default HighlightedText; 