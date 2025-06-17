/**
 * 🎯 Citation Renderer - Source Attribution Component
 */

import React from 'react';
import { Citation } from '../types/index';
import HighlightedText from './HighlightedText';
import { ExternalLink, FileText, Video, Image, Music, Bookmark } from 'lucide-react';
import { parseTextWithHighlighting } from '../utils/citationParser';

interface CitationRendererProps {
  content: string;
  citations: Citation[];
  debugMode?: boolean;
  onCitationClick?: (citation: Citation) => void;
}

const CitationRenderer: React.FC<CitationRendererProps> = ({
  content,
  citations = [],
  debugMode = false,
  onCitationClick
}) => {
  // Extract citations from content markers and combine with existing citations
  const allCitations = extractCitationsFromContent(content, citations);
  
  // Enhanced content formatting with markdown support
  const formattedContent = enhanceMarkdownFormatting(content);
  
  // Parse the text to get segments for highlighting
  const { segments } = parseTextWithHighlighting(formattedContent, allCitations);
  
  // Adapter function to convert citation to citationId for HighlightedText
  const handleCitationIdClick = (citationId: string) => {
    if (onCitationClick) {
      const citation = allCitations.find(c => c.id === citationId);
      if (citation) {
        onCitationClick(citation);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Enhanced formatted content with citations */}
      <div className="prose prose-sm max-w-none">
        <HighlightedText 
          segments={segments}
          citations={allCitations}
          discoveries={[]}
          onCitationClick={handleCitationIdClick}
        />
      </div>
      
      {/* Citation List */}
      {allCitations.length > 0 && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Bookmark size={14} />
            Sources ({allCitations.length})
          </h3>
          <div className="space-y-2">
            {allCitations.map((citation) => (
              <CitationCard 
                key={citation.id}
                citation={citation}
                debugMode={debugMode}
                onClick={() => onCitationClick?.(citation)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced markdown formatting for better content display
 */
function enhanceMarkdownFormatting(content: string): string {
  let formatted = content;

  // Replace **findings** with **discoveries** and hide the word finding
  formatted = formatted.replace(/\*\*(finding|findings)\*\*/gi, '**discovery**');
  formatted = formatted.replace(/\b(finding|findings)\b/gi, '**discovery**');
  
  // Enhanced header formatting
  formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
    return `${hashes} **${title.trim()}**`;
  });
  
  // Better bullet point formatting
  formatted = formatted.replace(/^\* /gm, '• ');
  formatted = formatted.replace(/^- /gm, '• ');
  formatted = formatted.replace(/^\+ /gm, '• ');
  
  // Enhanced bold and italic formatting
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
  formatted = formatted.replace(/\*([^*]+)\*/g, '*$1*');
  
  // Better numbered lists
  formatted = formatted.replace(/^(\d+)\.\s+/gm, '$1. ');
  
  // Clean up extra whitespace
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  formatted = formatted.trim();
  
  return formatted;
}

/**
 * Extract citations from content markers (like [Source: ... | URL: ... | Date: ... | Confidence: ...])
 */
function extractCitationsFromContent(content: string, existingCitations: Citation[]): Citation[] {
  const extractedCitations: Citation[] = [];
  const citationMarkerPattern = /\[Source:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\]]+)\]/g;
  
  let match;
  while ((match = citationMarkerPattern.exec(content)) !== null) {
    const [, title, urlPart, datePart, confidencePart] = match;
    
    // Extract URL from the URL part (might have "URL: " prefix)
    const url = urlPart.replace(/^URL:\s*/, '').trim();
    const date = datePart.replace(/^Date:\s*/, '').trim();
    const confidence = confidencePart.replace(/^Confidence:\s*/, '').trim();
    
    const citation: Citation = {
      id: `extracted-${extractedCitations.length + 1}`,
      source: title.trim(),
      type: determineSourceType(url),
      content: `Citation from ${title.trim()}`,
      relevance: parseConfidence(confidence),
      url: url,
      timestamp: parseDate(date),
      confidence: parseConfidence(confidence),
      quality: calculateQualityFromUrl(url),
      highlightedText: extractSentenceBeforeCitation(content, match.index!)
    };
    
    extractedCitations.push(citation);
  }
  
  // Combine with existing citations, avoiding duplicates
  const allCitations = [...extractedCitations];
  for (const existing of existingCitations) {
    if (!allCitations.find(c => c.url === existing.url || c.source === existing.source)) {
      allCitations.push(existing);
    }
  }
  
  return allCitations;
}

/**
 * Helper functions for citation extraction
 */
function determineSourceType(url: string): Citation['type'] {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('.pdf')) return 'pdf';
  if (url.includes('spotify.com') || url.includes('soundcloud.com')) return 'audio';
  if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif')) return 'image';
  if (url.includes('arxiv.org') || url.includes('docs.') || url.includes('.doc')) return 'document';
  return 'web';
}

function parseConfidence(confidence: string): number {
  switch (confidence.toLowerCase()) {
    case 'high': return 0.9;
    case 'medium': return 0.7;
    case 'low': return 0.5;
    default: return 0.6;
  }
}

function parseDate(dateStr: string): Date {
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function calculateQualityFromUrl(url: string): number {
  let quality = 0.5;
  
  if (url.includes('.edu') || url.includes('.gov')) quality += 0.2;
  if (url.includes('arxiv.org') || url.includes('scholar.google.com')) quality += 0.3;
  if (url.includes('wikipedia.org')) quality += 0.1;
  if (url.includes('ibm.com') || url.includes('nature.com') || url.includes('science.org')) quality += 0.2;
  
  return Math.min(quality, 1.0);
}

function extractSentenceBeforeCitation(text: string, citationIndex: number): string {
  // Find the start of the sentence that contains this citation
  const sentenceDelimiters = /[.!?]\s+/g;
  let lastDelimiterEnd = 0;
  
  let match;
  while ((match = sentenceDelimiters.exec(text)) !== null) {
    if (match.index + match[0].length >= citationIndex) {
      break;
    }
    lastDelimiterEnd = match.index + match[0].length;
  }
  
  return text.substring(lastDelimiterEnd, citationIndex).trim();
}

/**
 * Individual Citation Card Component
 */
interface CitationCardProps {
  citation: Citation;
  debugMode?: boolean;
  onClick?: () => void;
}

const CitationCard: React.FC<CitationCardProps> = ({ citation, debugMode, onClick }) => {
  const getSourceIcon = (type: Citation['type']) => {
    switch (type) {
      case 'document':
      case 'pdf':
        return <FileText size={16} className="text-red-600" />;
      case 'video':
        return <Video size={16} className="text-purple-600" />;
      case 'audio':
        return <Music size={16} className="text-green-600" />;
      case 'image':
        return <Image size={16} className="text-blue-600" />;
      default:
        return <ExternalLink size={16} className="text-gray-600" />;
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600 bg-green-50';
    if (quality >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div 
      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {getSourceIcon(citation.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {citation.source}
            </h4>
            {debugMode && (
              <div className="flex gap-1">
                <span className={`px-2 py-1 text-xs rounded ${getQualityColor(citation.quality || 0)}`}>
                  Q: {Math.round((citation.quality || 0) * 100)}%
                </span>
                <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-600">
                  C: {Math.round((citation.confidence || 0) * 100)}%
                </span>
              </div>
            )}
          </div>
          
          {citation.url && (
            <a 
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 truncate block mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {citation.url}
            </a>
          )}
          
          {citation.highlightedText && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              "{citation.highlightedText}"
            </p>
          )}
          
          {debugMode && (
            <div className="text-xs text-gray-500 mt-1">
              Type: {citation.type} • Relevance: {Math.round(citation.relevance * 100)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitationRenderer; 