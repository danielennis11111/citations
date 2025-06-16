/**
 * 🔗 Citation Renderer - RAG Citation Display Component
 * 
 * Renders citations from RAG sources in an accessible, professional format.
 * Integrates with the character system to show persona-aware citations.
 */

import React, { useState } from 'react';
import { FileText, ExternalLink, ChevronDown, ChevronRight, Quote, Globe, Zap, Target, BookOpen } from 'lucide-react';
import { Citation } from '../types/index';

export interface CitationReference {
  citationId: string;
  inlineText: string;
  position: number;
}

interface CitationRendererProps {
  citations: Citation[];
  showRelevanceScores?: boolean;
  showIncantations?: boolean;
  maxPreviewLength?: number;
  className?: string;
}

interface CitationCardProps {
  citation: Citation;
  showRelevance?: boolean;
  showIncantation?: boolean;
  maxPreviewLength?: number;
}

const CitationCard: React.FC<CitationCardProps> = ({ 
  citation, 
  showRelevance = false, 
  showIncantation = true,
  maxPreviewLength = 200 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getTypeIcon = (type: Citation['type']) => {
    switch (type) {
      case 'rag':
      case 'document':
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'web':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'external':
        return <ExternalLink className="w-4 h-4 text-green-600" />;
      case 'knowledge':
        return <Quote className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTypeColor = (type: Citation['type']) => {
    switch (type) {
      case 'rag':
      case 'document':
      case 'pdf':
      case 'web':
        return 'border-blue-200 bg-blue-50';
      case 'external':
        return 'border-green-200 bg-green-50';
      case 'knowledge':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getIncantationColor = (incantation?: string) => {
    const colors: Record<string, string> = {
      'semantic-search': 'bg-blue-100 text-blue-800',
      'chain-of-thought': 'bg-purple-100 text-purple-800',
      'expert-persona': 'bg-green-100 text-green-800',
      'working-backwards': 'bg-orange-100 text-orange-800',
      'assumption-reversal': 'bg-pink-100 text-pink-800'
    };
    return colors[incantation || ''] || 'bg-gray-100 text-gray-800';
  };
  
  const formatIncantation = (incantation?: string) => {
    if (!incantation) return 'Semantic Search';
    
    return incantation
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const truncatedContent = citation.content.length > maxPreviewLength
    ? citation.content.substring(0, maxPreviewLength) + '...'
    : citation.content;
  
  const contentToShow = isExpanded ? citation.content : truncatedContent;
  const needsTruncation = citation.content.length > maxPreviewLength;
  
  return (
    <div className={`border rounded-lg p-3 ${getTypeColor(citation.type)} hover:shadow-sm transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getTypeIcon(citation.type)}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {citation.source}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
              <span className="capitalize">{citation.type}</span>
              {citation.page && (
                <span>Page {citation.page}</span>
              )}
              {showRelevance && (
                <span className="text-blue-600 font-medium">
                  {Math.round(citation.relevance * 100)}% relevance
                </span>
              )}
              {citation.timestamp && (
                <span>{citation.timestamp.toLocaleDateString()}</span>
              )}
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
      
      {/* Incantation Badge (if enabled) */}
      {showIncantation && citation.incantationUsed && (
        <div className="mb-2 flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getIncantationColor(citation.incantationUsed)}`}>
            <Zap className="w-3 h-3" />
            <span>{formatIncantation(citation.incantationUsed)}</span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <p className="whitespace-pre-wrap">{contentToShow}</p>
        
        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3" />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Quality Metrics */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Relevance</span>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-blue-600" />
              <span className="font-medium">{Math.round((citation.relevance || 0) * 100)}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Quality</span>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-3 h-3 text-green-600" />
              <span className="font-medium">{Math.round((citation.quality || 0) * 100)}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confidence</span>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-purple-600" />
              <span className="font-medium">{Math.round((citation.confidence || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CitationRenderer: React.FC<CitationRendererProps> = ({
  citations,
  showRelevanceScores = false,
  showIncantations = true,
  maxPreviewLength = 200,
  className = ''
}) => {
  if (!citations || citations.length === 0) {
    return null;
  }
  
  // Sort citations by relevance (highest first)
  const sortedCitations = [...citations].sort((a, b) => b.relevance - a.relevance);
  
  // Group by incantation if showing incantations
  const groupedByIncantation = showIncantations 
    ? sortedCitations.reduce((groups, citation) => {
        const incantation = citation.incantationUsed || 'semantic-search';
        if (!groups[incantation]) {
          groups[incantation] = [];
        }
        groups[incantation].push(citation);
        return groups;
      }, {} as Record<string, Citation[]>)
    : { 'all': sortedCitations };
  
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
        <Quote className="w-4 h-4" />
        <span className="font-medium">
          Sources ({citations.length})
        </span>
        {showRelevanceScores && (
          <span className="text-xs text-gray-500">
            • Showing relevance scores
          </span>
        )}
      </div>
      
      {showIncantations ? (
        // If showing incantations, group by incantation type
        Object.entries(groupedByIncantation).map(([incantation, citationGroup]) => (
          <div key={incantation} className="space-y-2">
            {incantation !== 'all' && (
              <div className="flex items-center space-x-2 text-xs font-medium text-gray-700 mb-2">
                <Zap className="w-3 h-3" />
                <span>
                  {incantation
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')} 
                  ({citationGroup.length})
                </span>
              </div>
            )}
            
            <div className="space-y-2">
              {citationGroup.map((citation, index) => (
                <CitationCard
                  key={citation.id || `citation-${incantation}-${index}`}
                  citation={citation}
                  showRelevance={showRelevanceScores}
                  showIncantation={false} // Don't show in card since we're grouping
                  maxPreviewLength={maxPreviewLength}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        // If not showing incantations, just show all citations
        <div className="space-y-2">
          {sortedCitations.map((citation, index) => (
            <CitationCard
              key={citation.id || `citation-${index}`}
              citation={citation}
              showRelevance={showRelevanceScores}
              showIncantation={showIncantations}
              maxPreviewLength={maxPreviewLength}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CitationRenderer; 