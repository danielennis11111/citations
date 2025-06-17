/**
 * 📚 Citation Renderer - Display Citations with Interactive Source Links
 * 
 * Enhanced component that displays citations with clickable source links,
 * quality metrics, and simplified/debug mode support.
 */

import React from 'react';
import { Citation } from '../types/index';
import { ExternalLink, FileText, Globe, File, Database, Clock, Star, Zap } from 'lucide-react';

interface CitationRendererProps {
  citations: Citation[];
  showRelevanceScores?: boolean;
  showIncantations?: boolean;
  maxPreviewLength?: number;
  className?: string;
}

const getSourceIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <File className="w-4 h-4 text-red-500" />;
    case 'web':
      return <Globe className="w-4 h-4 text-blue-500" />;
    case 'document':
      return <FileText className="w-4 h-4 text-green-500" />;
    case 'rag':
      return <Database className="w-4 h-4 text-purple-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
};



const getRelevanceColor = (relevance: number) => {
  if (relevance >= 0.9) return 'bg-green-500';
  if (relevance >= 0.8) return 'bg-blue-500';
  if (relevance >= 0.7) return 'bg-yellow-500';
  return 'bg-orange-500';
};

const CitationRenderer: React.FC<CitationRendererProps> = ({
  citations,
  showRelevanceScores = false,
  showIncantations = false,
  maxPreviewLength = 150,
  className = ''
}) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatIncantationName = (incantation: string) => {
    return incantation
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className={className}>
      {citations.map((citation) => (
        <div key={citation.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          {/* Citation Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1">
              {getSourceIcon(citation.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {citation.source}
                  </h3>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      title="View original source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                
                {/* Source Details */}
                                 <div className="flex items-center space-x-3 text-xs text-gray-500">
                   <span className="flex items-center">
                     <Clock className="w-3 h-3 mr-1" />
                     {citation.timestamp?.toLocaleDateString() || 'No date'}
                   </span>
                  {citation.page && (
                    <span>Page {citation.page}</span>
                  )}
                  <span className="capitalize">{citation.type}</span>
                </div>
              </div>
            </div>
            
            {/* Quality Indicator */}
            {showRelevanceScores && (
              <div className="flex items-center space-x-2 ml-3">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getRelevanceColor(citation.relevance)}`}></div>
                  <span className="text-xs text-gray-600">{Math.round(citation.relevance * 100)}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Citation Content */}
          <div className="mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {truncateText(citation.content, maxPreviewLength)}
            </p>
            
            {citation.highlightedText && citation.highlightedText !== citation.content && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800 font-medium mb-1">Highlighted excerpt:</p>
                <p className="text-xs text-yellow-700">
                  "{truncateText(citation.highlightedText, 100)}"
                </p>
              </div>
            )}
          </div>

          {/* Debug Information */}
          {showRelevanceScores && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                             <div className="flex items-center space-x-4 text-xs text-gray-600">
                 <div className="flex items-center space-x-1">
                   <Star className="w-3 h-3" />
                   <span>Quality: {Math.round((citation.quality || 0) * 100)}%</span>
                 </div>
                 <div className="flex items-center space-x-1">
                   <span>Confidence: {Math.round((citation.confidence || 0) * 100)}%</span>
                 </div>
               </div>
              
              {showIncantations && citation.incantationUsed && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span className="text-xs text-purple-700 font-medium">
                    {formatIncantationName(citation.incantationUsed)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Simplified Mode Footer */}
          {!showRelevanceScores && citation.url && (
            <div className="pt-3 border-t border-gray-100">
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      ))}
      
      {citations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No citations available</p>
        </div>
      )}
    </div>
  );
};

export default CitationRenderer; 