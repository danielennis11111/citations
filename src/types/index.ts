export interface Citation {
  id: string;
  source: string;
  type: 'document' | 'web' | 'pdf' | 'video' | 'audio' | 'image';
  content: string;
  relevance: number;
  url?: string;
  page?: number;
  timestamp?: Date;
  documentId?: string;
  highlightedText?: string;
  confidence?: number;
  quality?: number;
  // Metadata from Gemini API
  title?: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
}

export interface CitationReference {
  citationId: string;
  inlineText: string;
  position: number;
  highlightStart?: number;
  highlightEnd?: number;
}

export interface HighlightedText {
  text: string;
  isHighlighted: boolean;
  citationId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  model?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Simplified discovery without incantations
export interface SourceDiscovery {
  query: string;
  timestamp: Date;
  results: Citation[];
  confidence: number;
  context: string;
  searchMethod: 'semantic' | 'keyword' | 'hybrid';
} 