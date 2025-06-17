/**
 * 🔗 Citation Parser - Enhanced Citation Processing for Real AI Chat
 * 
 * Converts AI responses into structured citations with text highlighting
 * for interactive source attribution.
 */

import { Citation, CitationReference, HighlightedText, SourceDiscovery } from '../types/index';

/**
 * Parse text and highlight cited content
 */
export function parseTextWithHighlighting(
  text: string,
  citations: Citation[],
  discoveries: SourceDiscovery[] = []
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  let currentIndex = 0;
  
  // Enhanced approach: look for quoted content that matches citation sources
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
 * Extract key phrases from text for fuzzy matching
 */
function extractKeyPhrases(text: string): string[] {
  const words = text.split(/\s+/);
  const phrases: string[] = [];
  
  // Extract 3-5 word phrases
  for (let i = 0; i <= words.length - 3; i++) {
    for (let len = 3; len <= Math.min(5, words.length - i); len++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (phrase.length >= 15) {
        phrases.push(phrase);
      }
    }
  }
  
  return phrases;
}

/**
 * Calculate citation quality based on various factors
 */
export function calculateCitationQuality(citation: Partial<Citation>): number {
  let quality = 0.5; // Base quality
  
  // Source type quality bonus
  if (citation.type === 'document' || citation.type === 'pdf') quality += 0.2;
  if (citation.url && (citation.url.includes('.edu') || citation.url.includes('.gov'))) quality += 0.2;
  if (citation.url && citation.url.includes('arxiv.org')) quality += 0.3;
  
  // Content quality
  if (citation.content && citation.content.length > 100) quality += 0.1;
  if (citation.author) quality += 0.1;
  if (citation.timestamp) quality += 0.1;
  
  return Math.min(quality, 1.0);
}

/**
 * Filter and rank citations by quality and relevance
 */
export function filterAndRankCitations(
  citations: Citation[], 
  minQuality: number = 0.3,
  maxCitations: number = 10
): Citation[] {
  return citations
    .filter(citation => (citation.quality || 0) >= minQuality)
    .sort((a, b) => {
      // Sort by relevance first, then by quality
      const relevanceDiff = b.relevance - a.relevance;
      if (Math.abs(relevanceDiff) > 0.05) return relevanceDiff;
      return (b.quality || 0) - (a.quality || 0);
    })
    .slice(0, maxCitations);
}

/**
 * Generate a simple bibliography from citations
 */
export function generateBibliography(citations: Citation[]): string {
  const sortedCitations = citations.sort((a, b) => a.source.localeCompare(b.source));
  
  return sortedCitations.map((citation, index) => {
    let entry = `${index + 1}. ${citation.source}`;
    
    if (citation.author) entry += ` by ${citation.author}`;
    if (citation.publishedDate) entry += ` (${citation.publishedDate})`;
    if (citation.url) entry += `. Available at: ${citation.url}`;
    
    return entry;
  }).join('\n');
}

/**
 * Create a source discovery object from search results
 */
export function createSourceDiscovery(
  query: string,
  citations: Citation[],
  context: string,
  searchMethod: 'semantic' | 'keyword' | 'hybrid' = 'semantic'
): SourceDiscovery {
  const avgConfidence = citations.reduce((sum, c) => sum + (c.confidence || 0), 0) / citations.length;
  
  return {
    query,
    timestamp: new Date(),
    results: citations,
    confidence: avgConfidence || 0.7,
    context,
    searchMethod
  };
} 