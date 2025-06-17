/**
 * 🤖 Real AI Chat with Citations - Gemini 2.0 Flash Integration
 * 
 * A working chat interface that provides AI responses with real source citations.
 * Users can input their own Gemini API key to test live functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Citation, ChatMessage, SourceDiscovery } from '../types/index';
import CitationRenderer from './CitationRenderer';
import HighlightedText from './HighlightedText';
import { parseTextWithHighlighting } from '../utils/citationParser';
import GeminiService, { GeminiConfig } from '../services/geminiService';
import { Send, Key, MessageSquare, BookOpen, Settings, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';

const CitationDemo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState('sources');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // API Configuration
  const [apiKey, setApiKey] = useState('');
  const [geminiService, setGeminiService] = useState<GeminiService | null>(null);
  
  // Selected data
  const [selectedSources, setSelectedSources] = useState<SourceDiscovery | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGeminiService(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeGeminiService = (key: string) => {
    try {
      const config: GeminiConfig = {
        apiKey: key,
        temperature: 0.7,
        maxTokens: 2048
      };
      const service = new GeminiService(config);
      setGeminiService(service);
      localStorage.setItem('gemini_api_key', key);
      setError(null);
      setShowApiKeyInput(false);
    } catch (err) {
      setError('Invalid API key configuration');
    }
  };

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid Gemini API key');
      return;
    }
    initializeGeminiService(apiKey.trim());
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !geminiService || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await geminiService.sendMessage(
        userMessage.content,
        messages.slice(-5), // Include last 5 messages for context
        true
      );

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        citations: response.citations,
        model: response.model
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-switch to sources tab if citations are found
      if (response.citations.length > 0) {
        setActiveTab('sources');
      }

    } catch (err) {
      setError(`Failed to get AI response: ${err}`);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCitationClick = (citationId: string) => {
    setActiveTab('sources');
    // Could scroll to specific citation here
  };

  const handleSourceSearch = async (query: string) => {
    if (!geminiService) return;
    
    setIsLoading(true);
    try {
      const sources = await geminiService.searchSources(query);
      setSelectedSources(sources);
      setActiveTab('search');
    } catch (err) {
      setError(`Failed to search sources: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all citations from all messages
  const allCitations = messages.flatMap(msg => msg.citations || []);

  // Demo content for when no API key is provided
  const renderApiKeyPrompt = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-6 text-center">
        <Key className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Connect to Gemini 2.0 Flash
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Enter your Google AI API key to start chatting with real citations
        </p>
        
        <div className="space-y-3">
          <input
            type="password"
            placeholder="Your Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
          />
          
          <button
            onClick={handleApiKeySubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect
          </button>
          
          <p className="text-xs text-gray-500">
            Get your free API key at{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => {
    return messages.map((message) => {
      const { segments } = message.citations 
        ? parseTextWithHighlighting(message.content, message.citations, [])
        : { segments: [{ text: message.content, isHighlighted: false }] };

      return (
        <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
            message.role === 'user' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white border border-gray-200'
          }`}>
            {message.role === 'assistant' ? (
              <HighlightedText
                segments={segments}
                citations={message.citations || []}
                discoveries={[]}
                onCitationClick={handleCitationClick}
                className="text-gray-800"
              />
            ) : (
              <p>{message.content}</p>
            )}
            
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                {message.citations.length} source{message.citations.length !== 1 ? 's' : ''} cited
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString()}
            {message.model && ` • ${message.model}`}
          </div>
        </div>
      );
    });
  };

  if (showApiKeyInput) {
    return (
      <div className="flex h-screen bg-gray-50">
        {renderApiKeyPrompt()}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarVisible ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-7 h-7 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Chat with Citations</h1>
                <p className="text-sm text-gray-600">Powered by Gemini 2.0 Flash • Real source verification</p>
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
                <span>{isDebugMode ? 'Debug' : 'Simple'}</span>
              </button>
              
              {/* API Key Button */}
              <button
                onClick={() => setShowApiKeyInput(true)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>API Key</span>
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

        {/* Messages Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-600 mb-6">Ask any question and get AI responses with verified source citations</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto text-sm">
                  {[
                    "What are the latest developments in AI?",
                    "Explain quantum computing basics",
                    "Recent climate change research findings",
                    "How does machine learning work?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMessage(suggestion)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            )}
          </div>
        </main>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="max-w-4xl mx-auto flex space-x-3">
            <textarea
              ref={chatInputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question with citations..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32"
              rows={1}
              disabled={isLoading || !geminiService}
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading || !geminiService}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeTab === 'sources'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  Sources ({allCitations.length})
                </button>
                {selectedSources && (
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeTab === 'search'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Search Results
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'sources' && (
                <div className="space-y-4">
                  {allCitations.length > 0 ? (
                    <>
                      <div className="text-xs text-gray-500 mb-3">
                        Sources from conversation • {isDebugMode ? 'Debug view' : 'Simple view'}
                      </div>
                      <CitationRenderer
                        citations={allCitations}
                        showRelevanceScores={isDebugMode}
                        showIncantations={false}
                        maxPreviewLength={isDebugMode ? 200 : 120}
                        className="space-y-3"
                      />
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No sources yet</p>
                      <p className="text-xs">Ask a question to see citations</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'search' && selectedSources && (
                <div className="space-y-4">
                  <div className="text-xs text-gray-500 mb-3">
                    Search: "{selectedSources.query}"
                  </div>
                  <CitationRenderer
                    citations={selectedSources.results}
                    showRelevanceScores={isDebugMode}
                    showIncantations={false}
                    maxPreviewLength={120}
                    className="space-y-3"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationDemo; 