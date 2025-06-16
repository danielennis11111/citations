/**
 * 🔗 Citation Parser - Enhanced RAG Citation Processing
 * 
 * Converts RAG results into structured citations with incantation tracking
 * and text highlighting for interactive source attribution.
 */

import { Citation, CitationReference, HighlightedText, RAGDiscovery } from '../types/index';

// Interface for RAG search results (matches your existing EnhancedRAG structure)
export interface RAGResult {
  chunk: {
    content: string;
    startIndex: number;
    endIndex: number;
    type?: string;
  };
  document: {
    id: string;
    name: string;
    type: string;
    uploadedAt: Date;
  };
  relevanceScore: number;
  context: string;
}

/**
 * Convert RAG results to structured citations with incantation tracking
 */
export function convertRAGResultsToCitations(
  ragResults: RAGResult[], 
  incantationUsed?: string,
  queryContext?: string
): Citation[] {
  return ragResults.map((result, index) => {
    // Calculate quality metrics
    const relevance = result.relevanceScore;
    const confidence = calculateConfidence(relevance, result.context.length);
    const quality = calculateCitationQuality({
      id: `rag-${result.document.id}-${index}`,
      source: result.document.name,
      type: 'rag',
      content: result.context,
      relevance: relevance
    });
    
    // Extract the most relevant text for highlighting
    const highlightedText = extractHighlightedText(result.context, result.chunk.content);
    
    // Create citation with enhanced metadata
    return {
      id: `rag-${result.document.id}-${index}`,
      source: result.document.name,
      type: 'rag' as const,
      content: result.context,
      relevance: relevance,
      timestamp: result.document.uploadedAt,
      documentId: result.document.id,
      incantationUsed: incantationUsed || 'semantic-search',
      highlightedText: highlightedText,
      confidence: confidence,
      quality: quality,
      // Add page information if available
      page: result.chunk.startIndex ? Math.floor(result.chunk.startIndex / 1000) + 1 : undefined,
      // Add excerpt for tooltips
      excerpt: highlightedText || result.context.substring(0, 150)
    };
  });
}

/**
 * Extract the most relevant text snippet for highlighting
 */
function extractHighlightedText(fullContext: string, chunkContent: string): string {
  // If chunk content is available and shorter, use it
  if (chunkContent && chunkContent.length < 200) {
    return chunkContent;
  }
  
  // Otherwise, find the most important sentence in the context
  const sentences = fullContext.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return fullContext.substring(0, 150);
  
  // Return the longest sentence (likely most informative)
  const longestSentence = sentences.reduce((prev, current) => 
    current.length > prev.length ? current : prev
  );
  
  return longestSentence.trim();
}

/**
 * Calculate confidence score based on relevance and content quality
 */
function calculateConfidence(relevanceScore: number, contentLength: number): number {
  let confidence = relevanceScore * 0.7; // Base confidence from relevance
  
  // Content length factor
  if (contentLength >= 100 && contentLength <= 500) {
    confidence += 0.2; // Ideal length
  } else if (contentLength >= 50) {
    confidence += 0.1; // Acceptable length
  }
  
  // Semantic quality boost (placeholder - could add NLP analysis)
  confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

/**
 * Parse text and highlight RAG-sourced content
 */
export function parseTextWithHighlighting(
  text: string,
  citations: Citation[],
  discoveries: RAGDiscovery[] = []
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  let currentIndex = 0;
  
  // Enhanced approach: look for quoted content that matches citation sources
  // For production systems, consider using more sophisticated NLP or embedding similarity
  
  for (const citation of citations) {
    const highlightText = citation.highlightedText || citation.content.substring(0, 100);
    
    // Try to find an exact match first (case insensitive)
    let matchIndex = text.toLowerCase().indexOf(highlightText.toLowerCase().substring(0, Math.min(50, highlightText.length)));
    
    // If no exact match, try fuzzy matching with key phrases
    if (matchIndex === -1) {
      // Extract key phrases (4+ word sequences)
      const keyPhrases = extractKeyPhrases(highlightText);
      
      for (const phrase of keyPhrases) {
        if (phrase.length >= 15) { // Only use substantial phrases
          const phraseIndex = text.toLowerCase().indexOf(phrase.toLowerCase());
          if (phraseIndex !== -1) {
            matchIndex = phraseIndex;
            break;
          }
        }
      }
    }
    
    if (matchIndex !== -1 && matchIndex >= currentIndex) {
      // Add non-highlighted text before this match
      if (matchIndex > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, matchIndex),
          isHighlighted: false
        });
      }
      
      // Add highlighted text
      const matchEnd = matchIndex + highlightText.length;
      segments.push({
        text: text.substring(matchIndex, Math.min(matchEnd, text.length)),
        isHighlighted: true,
        citationId: citation.id
      });
      
      // Add reference
      references.push({
        citationId: citation.id,
        inlineText: text.substring(matchIndex, Math.min(matchEnd, text.length)),
        position: matchIndex,
        highlightStart: matchIndex,
        highlightEnd: Math.min(matchEnd, text.length)
      });
      
      currentIndex = Math.min(matchEnd, text.length);
    }
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isHighlighted: false
    });
  }
  
  // If no matches found, return the entire text as non-highlighted
  if (segments.length === 0) {
    segments.push({
      text: text,
      isHighlighted: false
    });
  }
  
  return { segments, references };
}

/**
 * Extract key phrases from text for better matching
 */
function extractKeyPhrases(text: string): string[] {
  const phrases: string[] = [];
  
  // Simple implementation: split by common delimiters and get phrases with 4+ words
  const sentences = text.split(/[.!?;]+/).map(s => s.trim()).filter(s => s.length > 0);
  
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    if (words.length >= 4) {
      phrases.push(sentence);
      
      // Also add sub-phrases for better matching
      if (words.length > 6) {
        for (let i = 0; i <= words.length - 4; i++) {
          const subPhrase = words.slice(i, i + 4).join(' ');
          phrases.push(subPhrase);
        }
      }
    }
  }
  
  return phrases;
}

/**
 * Create a RAG discovery record
 */
export function createRAGDiscovery(
  query: string,
  incantationUsed: string,
  citations: Citation[],
  context: string
): RAGDiscovery {
  return {
    query,
    incantationUsed,
    timestamp: new Date(),
    results: citations,
    confidence: citations.length > 0 ? 
      citations.reduce((sum, c) => sum + (c.confidence || 0), 0) / citations.length : 0,
    context
  };
}

/**
 * Enhanced citation quality calculation
 */
export function calculateCitationQuality(citation: Partial<Citation>): number {
  let score = (citation.relevance || 0) * 0.6; // 60% weight for relevance
  
  // Content length factor
  const contentLength = citation.content?.length || 0;
  let lengthScore = 0;
  
  if (contentLength >= 50 && contentLength <= 300) {
    lengthScore = 1; // Ideal length
  } else if (contentLength >= 20 && contentLength <= 500) {
    lengthScore = 0.8; // Good length
  } else if (contentLength >= 10) {
    lengthScore = 0.5; // Acceptable length
  }
  
  score += lengthScore * 0.2; // 20% weight for length
  
  // Confidence factor
  score += (citation.confidence || 0.5) * 0.2; // 20% weight for confidence
  
  return Math.min(score, 1);
}

/**
 * Legacy function for backward compatibility
 */
export function parseTextWithCitations(text: string, citations: Citation[]): {
  cleanText: string;
  references: CitationReference[];
} {
  const { segments, references } = parseTextWithHighlighting(text, citations);
  const cleanText = segments.map(s => s.text).join('');
  return { cleanText, references };
}

/**
 * Extract relevant quotes from citations based on query terms
 */
export function extractRelevantQuotes(
  citations: Citation[], 
  queryTerms: string[], 
  maxQuoteLength: number = 150
): Citation[] {
  return citations.map(citation => {
    const terms = queryTerms.map(term => term.toLowerCase());
    
    // Find best matching excerpt
    let bestMatch = '';
    let bestScore = 0;
    
    // Split content into sentences
    const sentences = citation.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length === 0) continue;
      
      // Check how many query terms appear in this sentence
      const score = terms.reduce((acc, term) => {
        return acc + (sentence.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
      
      // Prefer sentences with more query terms
      if (score > bestScore) {
        bestScore = score;
        bestMatch = sentence;
      }
    }
    
    // If no good match found, use the first sentence
    if (bestMatch.length === 0 && sentences.length > 0) {
      bestMatch = sentences[0];
    }
    
    // Truncate if too long
    if (bestMatch.length > maxQuoteLength) {
      bestMatch = bestMatch.substring(0, maxQuoteLength) + '...';
    }
    
    // Return citation with the best excerpt
    return {
      ...citation,
      excerpt: bestMatch
    };
  });
}

/**
 * Insert citation markers into text
 */
export function insertCitationMarkers(
  text: string, 
  ragResults: RAGResult[]
): { 
  textWithCitations: string; 
  citations: Citation[] 
} {
  const citations = convertRAGResultsToCitations(ragResults);
  let textWithCitations = text;
  
  // Insert citation markers at the end of sentences
  const sentences = text.split(/([.!?]+\s)/).filter(s => s.trim().length > 0);
  let currentIndex = 0;
  
  for (let i = 0; i < Math.min(sentences.length, citations.length); i++) {
    const sentence = sentences[i];
    currentIndex += sentence.length;
    
    // Add citation marker after sentence
    textWithCitations = 
      textWithCitations.substring(0, currentIndex) + 
      ` [${i + 1}]` + 
      textWithCitations.substring(currentIndex);
    
    // Update index for next insertion
    currentIndex += 4; // Length of " [n]"
  }
  
  return { textWithCitations, citations };
}

/**
 * Generate a bibliography from citations
 */
export function generateBibliography(citations: Citation[]): string {
  if (citations.length === 0) return '';
  
  let bibliography = '## Sources\n\n';
  
  citations.forEach((citation, index) => {
    const formattedDate = citation.timestamp ? 
      citation.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 
      'n.d.';
    
    bibliography += `[${index + 1}] ${citation.source}`;
    
    if (citation.page) {
      bibliography += `, p. ${citation.page}`;
    }
    
    if (citation.documentId) {
      bibliography += ` (Document ID: ${citation.documentId})`;
    }
    
    bibliography += `. Retrieved on ${formattedDate}`;
    
    if (citation.url) {
      bibliography += ` from ${citation.url}`;
    }
    
    bibliography += '\n\n';
  });
  
  return bibliography;
}

/**
 * Filter and rank citations by quality
 */
export function filterAndRankCitations(
  citations: Citation[], 
  minQuality: number = 0.3,
  maxCitations: number = 5
): Citation[] {
  return citations
    .filter(citation => (citation.quality || 0) >= minQuality)
    .sort((a, b) => (b.quality || 0) - (a.quality || 0))
    .slice(0, maxCitations);
} 