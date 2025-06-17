/**
 * 🍪 Interactive Chat Demo with Citation Tooltips
 * 
 * Demonstrates a realistic chat session about chocolate chip cookies with proper citation tooltips.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Eye, 
  EyeOff,
  BookOpen,
  FileText,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Citation } from '../types/index';

// Realistic citations for chocolate chip cookie information
const COOKIE_CITATIONS: Citation[] = [
  {
    id: 'tollhouse-original',
    source: 'Nestlé Toll House - Original Recipe',
    type: 'web',
    content: 'The original chocolate chip cookie recipe was created by Ruth Wakefield at the Toll House Inn in 1938. She added broken pieces of Nestlé semi-sweet chocolate to her butter drop cookie dough.',
    relevance: 0.96,
    url: 'https://www.verybestbaking.com/toll-house/recipes/original-nestle-toll-house-chocolate-chip-cookies/',
    timestamp: new Date('2024-01-15'),
    confidence: 0.94,
    quality: 0.92
  },
  {
    id: 'brown-butter-science',
    source: 'Serious Eats - The Science of Brown Butter',
    type: 'web',
    content: 'Brown butter adds a nutty, complex flavor to cookies. The browning process (Maillard reaction) creates new flavor compounds that enhance the overall taste profile of baked goods.',
    relevance: 0.91,
    url: 'https://www.seriouseats.com/brown-butter-chocolate-chip-cookie-recipe',
    timestamp: new Date('2023-11-20'),
    confidence: 0.89,
    quality: 0.88
  },
  {
    id: 'baking-soda-chemistry',
    source: 'King Arthur Baking - Baking Soda vs Baking Powder',
    type: 'web',
    content: 'Baking soda creates a more chewy texture in cookies by neutralizing acids and creating carbon dioxide gas. The amount used affects spread and texture significantly.',
    relevance: 0.87,
    url: 'https://www.kingarthurbaking.com/blog/2018/06/11/baking-soda-vs-baking-powder',
    timestamp: new Date('2024-02-10'),
    confidence: 0.85,
    quality: 0.86
  },
  {
    id: 'chilling-dough',
    source: 'Food Network - Cookie Dough Chilling Guide',
    type: 'web',
    content: 'Chilling cookie dough for at least 2 hours prevents excessive spreading and creates thicker cookies with better texture. Cold butter takes longer to melt in the oven.',
    relevance: 0.89,
    url: 'https://www.foodnetwork.com/how-to/articles/cookie-dough-chilling-guide',
    timestamp: new Date('2023-12-05'),
    confidence: 0.87,
    quality: 0.84
  },
  {
    id: 'chocolate-types',
    source: 'Ghirardelli - Chocolate Chip Guide',
    type: 'web',
    content: 'Semi-sweet chocolate chips contain 35-65% cocoa solids and maintain their shape better during baking. Dark chocolate chips provide more intense flavor with higher cocoa content.',
    relevance: 0.85,
    url: 'https://www.ghirardelli.com/chocolate-chip-guide',
    timestamp: new Date('2024-01-08'),
    confidence: 0.83,
    quality: 0.81
  }
];

// Mock chat messages with citations
const CHAT_MESSAGES = [
  {
    id: 'user-1',
    role: 'user' as const,
    content: 'Can you give me a great chocolate chip cookie recipe?',
    timestamp: new Date('2024-03-15T14:30:00')
  },
  {
    id: 'assistant-1',
    role: 'assistant' as const,
    content: `I'd be happy to share a fantastic chocolate chip cookie recipe! Here's a tried-and-true version based on time-tested techniques:

**Classic Chocolate Chip Cookies**

**Ingredients:**
• 2¼ cups all-purpose flour
• 1 tsp baking soda
• 1 tsp salt
• 1 cup butter, softened (or try brown butter for extra flavor)
• ¾ cup granulated sugar
• ¾ cup packed brown sugar
• 2 large eggs
• 2 tsp vanilla extract
• 2 cups semi-sweet chocolate chips

**Instructions:**

1. **Prepare:** Preheat oven to 375°F. Line baking sheets with parchment paper.

2. **Mix dry ingredients:** Whisk together flour, baking soda, and salt in a bowl.

3. **Cream butter and sugars:** Beat softened butter with both sugars until light and fluffy (about 3-4 minutes).

4. **Add eggs and vanilla:** Beat in eggs one at a time, then vanilla extract.

5. **Combine:** Gradually mix in flour mixture until just combined. Fold in chocolate chips.

6. **Chill the dough:** For best results, chill dough for at least 2 hours before baking.

7. **Bake:** Drop rounded tablespoons of dough onto prepared sheets. Bake 9-11 minutes until golden brown around edges.

This recipe is based on the original Toll House recipe created by Ruth Wakefield in 1938, with some modern improvements for texture and flavor!`,
    timestamp: new Date('2024-03-15T14:31:00'),
    citations: [COOKIE_CITATIONS[0]]
  },
  {
    id: 'user-2',
    role: 'user' as const,
    content: 'What makes cookies chewy vs crispy?',
    timestamp: new Date('2024-03-15T14:32:00')
  },
  {
    id: 'assistant-2',
    role: 'assistant' as const,
    content: `Great question! The texture of cookies depends on several key factors:

**For Chewy Cookies:**
• Use more brown sugar than white sugar (moisture retention)
• Slightly underbake them (remove when edges are set but centers look soft)
• Use baking soda rather than baking powder for better spread control
• Chill the dough to prevent excessive spreading

**For Crispy Cookies:**
• Use more white sugar than brown sugar
• Bake longer until fully golden
• Use less flour or add a bit more butter
• Bake at a slightly higher temperature

**The Science Behind It:**
The baking soda creates carbon dioxide gas that helps achieve the perfect chewy texture by controlling how much the cookies spread. Brown butter can also add amazing nutty flavor while maintaining chewiness.

The key is understanding how each ingredient affects the final texture!`,
    timestamp: new Date('2024-03-15T14:33:00'),
    citations: [COOKIE_CITATIONS[2], COOKIE_CITATIONS[1]]
  }
];

// Citation tooltip component
const CitationTooltip: React.FC<{
  citation: Citation;
  children: React.ReactNode;
}> = ({ citation, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    if (citation.url) {
      window.open(citation.url, '_blank');
    }
  };

  return (
    <>
      <span
        className="bg-asu-gold-100 border-b-2 border-asu-gold-500 cursor-pointer hover:bg-asu-gold-200 transition-colors px-1 rounded relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title="Click to view source"
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm pointer-events-none"
          style={{
            left: position.x + 10,
            top: position.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="flex items-start space-x-2 mb-2">
            {citation.type === 'web' ? (
              <Globe className="w-4 h-4 text-asu-gold-600 mt-0.5" />
            ) : (
              <FileText className="w-4 h-4 text-asu-gold-600 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {citation.source}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="capitalize">{citation.type}</span>
                <span>•</span>
                <span>{Math.round(citation.relevance * 100)}% relevant</span>
              </div>
            </div>
            {citation.url && (
              <ExternalLink className="w-3 h-3 text-gray-400" />
            )}
          </div>
          
          <p className="text-sm text-gray-700 leading-relaxed">
            {citation.content.length > 150 
              ? citation.content.substring(0, 150) + '...'
              : citation.content
            }
          </p>
          
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Quality: {Math.round((citation.quality || 0) * 100)}%</span>
              <span>Confidence: {Math.round((citation.confidence || 0) * 100)}%</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced message content with citation highlighting
const MessageContent: React.FC<{
  content: string;
  citations?: Citation[];
}> = ({ content, citations = [] }) => {
  
  const citationMap = citations.reduce((map, citation) => {
    map[citation.id] = citation;
    return map;
  }, {} as Record<string, Citation>);

  // Define text segments that should be highlighted with citations
  const highlightRules = [
    { text: 'original Toll House recipe created by Ruth Wakefield in 1938', citationId: 'tollhouse-original' },
    { text: 'baking soda creates carbon dioxide gas', citationId: 'baking-soda-chemistry' },
    { text: 'Brown butter can also add amazing nutty flavor', citationId: 'brown-butter-science' },
    { text: 'chill dough for at least 2 hours', citationId: 'chilling-dough' },
    { text: 'baking soda rather than baking powder', citationId: 'baking-soda-chemistry' }
  ];

  let processedContent = content;
  const replacements: { original: string; replacement: JSX.Element }[] = [];

  // Process each highlight rule
  highlightRules.forEach((rule, index) => {
    const citation = citationMap[rule.citationId];
    if (citation && processedContent.includes(rule.text)) {
      const key = `citation-${index}`;
      const replacement = (
        <CitationTooltip key={key} citation={citation}>
          {rule.text}
        </CitationTooltip>
      );
      
      replacements.push({
        original: rule.text,
        replacement
      });
    }
  });

  // Apply replacements to create final JSX
  if (replacements.length === 0) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Split content and apply highlights
  let parts: (string | JSX.Element)[] = [content];
  
  replacements.forEach((replacement, index) => {
    const newParts: (string | JSX.Element)[] = [];
    
    parts.forEach(part => {
      if (typeof part === 'string') {
        const splitParts = part.split(replacement.original);
        for (let i = 0; i < splitParts.length; i++) {
          if (splitParts[i]) newParts.push(splitParts[i]);
          if (i < splitParts.length - 1) {
            newParts.push(replacement.replacement);
          }
        }
      } else {
        newParts.push(part);
      }
    });
    
    parts = newParts;
  });

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </div>
  );
};

const CitationDemo: React.FC = () => {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;
    
    const newMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: currentMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // Add a simple response for demo purposes
    setTimeout(() => {
      const response = {
        id: `assistant-${Date.now()}`,
        role: 'assistant' as const,
        content: `Thanks for your question! In a real implementation, this would connect to an AI service that provides responses with proper citations about baking and cooking.`,
        timestamp: new Date(),
        citations: []
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const allCitations = messages.flatMap(msg => msg.citations || []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarVisible ? 'mr-96' : 'mr-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-7 h-7 text-asu-gold-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cookie Recipe Chat</h1>
                <p className="text-sm text-gray-600">Interactive citations • Hover over highlighted text</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-asu-gold-100 text-asu-gold-800 border border-asu-gold-200 hover:bg-asu-gold-200 transition-colors"
            >
              {sidebarVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{sidebarVisible ? 'Hide' : 'Show'} Sources</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-auto p-6 min-h-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    {message.role === 'user' ? (
                      <img 
                        src="/citations/user-avatar.jpg"
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img 
                        src="/citations/ai-avatar.png"
                        alt="AI assistant avatar" 
                        className="w-full h-full object-cover object-center"
                      />
                    )}
                  </div>
                  
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-asu-gold-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {message.role === 'assistant' ? (
                        <MessageContent 
                          content={message.content} 
                          citations={message.citations}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                    
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {message.citations.length} source{message.citations.length !== 1 ? 's' : ''} cited
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="max-w-4xl mx-auto flex space-x-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about baking techniques, ingredients, or recipes..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-asu-gold-500 focus:border-asu-gold-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
              className="bg-asu-gold-600 text-white p-3 rounded-lg hover:bg-asu-gold-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sources Sidebar */}
      {sidebarVisible && (
        <div className="fixed right-0 top-0 w-96 h-screen bg-white border-l border-gray-200 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-asu-gold-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Sources ({allCitations.length})
                </h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">Hover over highlighted text to see details</p>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {allCitations.map((citation) => (
                                 <div key={citation.id} className="border border-asu-gold-200 bg-asu-gold-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                                                             <Globe className="w-4 h-4 text-asu-gold-600" />
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {citation.source}
                      </h4>
                    </div>
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-asu-gold-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {citation.content}
                  </p>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Relevance: {Math.round(citation.relevance * 100)}%</span>
                    <span>Quality: {Math.round((citation.quality || 0) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitationDemo; 