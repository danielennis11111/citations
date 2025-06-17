/**
 * 🔍 RAG Discovery Panel - Show Incantation-Powered Research History
 * 
 * Displays the discoveries made through RAG searches, showing what prompt patterns
 * (incantations) led to finding specific information in documents.
 */

import React, { useState } from 'react';
import { Search, Zap, FileText, Clock, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { RAGDiscovery } from '../types/index';

interface RAGDiscoveryPanelProps {
  discoveries: RAGDiscovery[];
  onDiscoveryClick?: (discovery: RAGDiscovery) => void;
  className?: string;
}

interface DiscoveryCardProps {
  discovery: RAGDiscovery;
  onClick?: () => void;
}

const DiscoveryCard: React.FC<DiscoveryCardProps> = ({ discovery, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getIncantationColor = (incantation: string) => {
    const colors: Record<string, string> = {
      'semantic-search': 'bg-blue-100 text-blue-800',
      'chain-of-thought': 'bg-purple-100 text-purple-800',
      'expert-persona': 'bg-green-100 text-green-800',
      'working-backwards': 'bg-orange-100 text-orange-800',
      'assumption-reversal': 'bg-pink-100 text-pink-800'
    };
    return colors[incantation] || 'bg-gray-100 text-gray-800';
  };
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };
  
  // Calculate average quality score
  const avgQuality = discovery.results.length > 0
    ? discovery.results.reduce((sum, r) => sum + (r.quality || 0.5), 0) / discovery.results.length
    : 0.5;
  
  // Get quality color
  const getQualityColor = (quality: number) => {
    if (quality >= 0.8) return 'text-green-600';
    if (quality >= 0.6) return 'text-blue-600';
    if (quality >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer bg-white"
      onClick={() => {
        setIsExpanded(!isExpanded);
        onClick?.();
      }}
    >
      {/* Header */}
      <div className="flex items-start space-x-3 mb-3">
        <Search className="w-5 h-5 text-gray-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            "{discovery.query}"
          </h4>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatTimestamp(discovery.timestamp)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {discovery.results.length} sources
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${getQualityColor(avgQuality)}`}>
                {Math.round(avgQuality * 100)}% quality
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Incantation Badge */}
      <div className="flex items-center space-x-2 mb-3">
        <Zap className="w-4 h-4 text-purple-600" />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIncantationColor(discovery.incantationUsed)}`}>
          {discovery.incantationUsed.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </span>
      </div>
      
      {/* Quality Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Discovery Quality</span>
          <span className={getQualityColor(avgQuality)}>{Math.round(avgQuality * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              avgQuality >= 0.8 ? 'bg-green-500' :
              avgQuality >= 0.6 ? 'bg-blue-500' :
              avgQuality >= 0.4 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.max(avgQuality * 100, 5)}%` }}
          />
        </div>
      </div>
      
      {/* Results Preview */}
      <div className="space-y-2">
        {discovery.results.slice(0, isExpanded ? undefined : 2).map((result, index) => (
          <div key={result.id} className="bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                {result.source}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(result.relevance * 100)}% match
              </span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {result.highlightedText || result.content.substring(0, 100)}...
            </p>
          </div>
        ))}
        
        {!isExpanded && discovery.results.length > 2 && (
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            <ChevronDown className="w-3 h-3" />
            <span>+{discovery.results.length - 2} more sources</span>
          </button>
        )}
        
        {isExpanded && (
          <button 
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
          >
            <ChevronUp className="w-3 h-3" />
            <span>Show less</span>
          </button>
        )}
      </div>
      
      {/* Quality Indicators */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span>Quality: {Math.round((discovery.results.reduce((sum, r) => sum + (r.quality || 0.5), 0) / discovery.results.length) * 100)}%</span>
          <span>Sources: {discovery.results.length}</span>
        </div>
        <Target className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
};

const RAGDiscoveryPanel: React.FC<RAGDiscoveryPanelProps> = ({
  discoveries,
  onDiscoveryClick,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'incantations' | 'timeline'>('all');
  
  if (discoveries.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">No RAG discoveries yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload documents and ask questions to see incantation-powered research
        </p>
      </div>
    );
  }
  
  // Sort discoveries by timestamp (newest first)
  const sortedDiscoveries = [...discoveries].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  // Group by incantation type
  const groupedByIncantation = sortedDiscoveries.reduce((groups, discovery) => {
    const incantation = discovery.incantationUsed;
    if (!groups[incantation]) {
      groups[incantation] = [];
    }
    groups[incantation].push(discovery);
    return groups;
  }, {} as Record<string, RAGDiscovery[]>);
  
  // Get incantation stats
  const incantationStats = Object.entries(groupedByIncantation).map(([incantation, discoveries]) => {
    const totalSources = discoveries.reduce((sum, d) => sum + d.results.length, 0);
    const avgQuality = discoveries.reduce((sum, d) => {
      const discoveryQuality = d.results.reduce((s, r) => s + (r.quality || 0.5), 0) / d.results.length;
      return sum + discoveryQuality;
    }, 0) / discoveries.length;
    
    return {
      incantation,
      count: discoveries.length,
      totalSources,
      avgQuality
    };
  }).sort((a, b) => b.count - a.count);
  
  // Get incantation color
  const getIncantationColor = (incantation: string) => {
    const colors: Record<string, string> = {
      'semantic-search': 'bg-blue-100 text-blue-800 border-blue-200',
      'chain-of-thought': 'bg-purple-100 text-purple-800 border-purple-200',
      'expert-persona': 'bg-green-100 text-green-800 border-green-200',
      'working-backwards': 'bg-orange-100 text-orange-800 border-orange-200',
      'assumption-reversal': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[incantation] || 'bg-gray-100 text-gray-800 border-gray-200';
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All Discoveries
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'incantations' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('incantations')}
        >
          By Incantation
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'timeline' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
      </div>
      
      {/* Summary */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-purple-900">Research Discovery History</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-purple-600 font-medium">{discoveries.length}</span>
            <span className="text-purple-700"> Discoveries</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">{Object.keys(groupedByIncantation).length}</span>
            <span className="text-purple-700"> Incantations</span>
          </div>
          <div>
            <span className="text-purple-600 font-medium">
              {discoveries.reduce((sum, d) => sum + d.results.length, 0)}
            </span>
            <span className="text-purple-700"> Sources</span>
          </div>
        </div>
      </div>
      
      {/* All Discoveries Tab */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {sortedDiscoveries.map((discovery, index) => (
            <DiscoveryCard
              key={`${discovery.timestamp.getTime()}-${index}`}
              discovery={discovery}
              onClick={() => onDiscoveryClick?.(discovery)}
            />
          ))}
        </div>
      )}
      
      {/* Incantations Tab */}
      {activeTab === 'incantations' && (
        <div className="space-y-4">
          {/* Incantation Stats */}
          <div className="grid grid-cols-1 gap-3">
            {incantationStats.map(stat => (
              <div 
                key={stat.incantation} 
                className={`border rounded-lg p-3 ${getIncantationColor(stat.incantation)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <h4 className="text-sm font-medium">
                      {stat.incantation.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </h4>
                  </div>
                  <span className="text-xs font-medium">{stat.count} discoveries</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sources:</span>
                    <span className="font-medium ml-1">{stat.totalSources}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quality:</span>
                    <span className="font-medium ml-1">{Math.round(stat.avgQuality * 100)}%</span>
                  </div>
                </div>
                
                {/* Quality Bar */}
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-white bg-opacity-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-white bg-opacity-80"
                      style={{ width: `${Math.max(stat.avgQuality * 100, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Discoveries by Incantation */}
          {Object.entries(groupedByIncantation).map(([incantation, discoveries]) => (
            <div key={incantation} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <Zap className="w-3 h-3 text-purple-600" />
                <span>{incantation.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                <span className="text-xs text-gray-500">({discoveries.length})</span>
              </h4>
              
              <div className="space-y-2 pl-5">
                {discoveries.map((discovery, index) => (
                  <DiscoveryCard
                    key={`${incantation}-${index}`}
                    discovery={discovery}
                    onClick={() => onDiscoveryClick?.(discovery)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* Timeline by day */}
          {(() => {
            // Group by day
            const byDay = sortedDiscoveries.reduce((days, discovery) => {
              const date = discovery.timestamp.toLocaleDateString();
              if (!days[date]) {
                days[date] = [];
              }
              days[date].push(discovery);
              return days;
            }, {} as Record<string, RAGDiscovery[]>);
            
            return Object.entries(byDay).map(([date, dayDiscoveries]) => (
              <div key={date} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-300 flex-grow"></div>
                  <span className="text-xs font-medium text-gray-500">{date}</span>
                  <div className="h-px bg-gray-300 flex-grow"></div>
                </div>
                
                <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                  {dayDiscoveries.map((discovery, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[25px] top-4 w-4 h-4 rounded-full bg-white border-2 border-purple-500"></div>
                      <div className="text-xs text-gray-500 mb-1">
                        {discovery.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <DiscoveryCard
                        discovery={discovery}
                        onClick={() => onDiscoveryClick?.(discovery)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
};

export default RAGDiscoveryPanel; 