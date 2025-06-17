export interface Citation {
  id: string;
  source: string;
  type: 'rag' | 'knowledge' | 'external' | 'document' | 'web' | 'pdf';
  content: string;
  relevance: number;
  url?: string;
  page?: number;
  timestamp?: Date;
  documentId?: string;
  incantationUsed?: string;
  highlightedText?: string;
  confidence?: number;
  quality?: number;
  // Additional properties for CitationTooltip
  title?: string;
  excerpt?: string;
  documentName?: string;
  pageNumber?: number;
  relevanceScore?: number;
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

export interface RAGDiscovery {
  query: string;
  incantationUsed: string;
  timestamp: Date;
  results: Citation[];
  confidence: number;
  context: string;
} 