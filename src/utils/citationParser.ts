/**
 * 🔗 Citation Parser - Enhanced Citation Processing for Real AI Chat
 * 
 * Converts AI responses into structured citations with text highlighting
 * for interactive source attribution.
 */

import { Citation, CitationReference, HighlightedText, SourceDiscovery } from '../types/index';

/**
 * Parse text and highlight cited content - Enhanced for Gemini citation format
 */
export function parseTextWithHighlighting(
  text: string,
  citations: Citation[],
  discoveries: SourceDiscovery[] = []
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  // First, extract citation markers and replace them with placeholders
  const citationMarkerPattern = /\[Source:\s*([^|]+)\s*\|\s*URL:\s*([^|]+)\s*\|\s*Date:\s*([^|]+)\s*\|\s*Confidence:\s*([^\]]+)\]/g;
  const citationMarkers: Array<{
    match: string;
    start: number;
    end: number;
    citation: Citation;
  }> = [];
  
  let match;
  while ((match = citationMarkerPattern.exec(text)) !== null) {
    const [fullMatch, title, url, date, confidence] = match;
    
    // Create a citation object from the marker
    const citation: Citation = {
      id: `citation-${citationMarkers.length + 1}`,
      source: title.trim(),
      type: determineSourceType(url.trim()),
      content: `Citation from ${title.trim()}`,
      relevance: parseConfidence(confidence.trim()),
      url: url.trim(),
      timestamp: parseDate(date.trim()),
      confidence: parseConfidence(confidence.trim()),
      quality: calculateQualityFromUrl(url.trim()),
      highlightedText: extractSentenceBeforeCitation(text, match.index!)
    };
    
    citationMarkers.push({
      match: fullMatch,
      start: match.index!,
      end: match.index! + fullMatch.length,
      citation
    });
  }
  
  // If we found citation markers, process them
  if (citationMarkers.length > 0) {
    return parseTextWithMarkers(text, citationMarkers);
  }
  
  // Fallback to original citation matching for pre-existing citations
  return parseTextWithExistingCitations(text, citations);
}

/**
 * Parse text that contains citation markers
 */
function parseTextWithMarkers(
  text: string,
  citationMarkers: Array<{
    match: string;
    start: number;
    end: number;
    citation: Citation;
  }>
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  let currentIndex = 0;
  
  for (const marker of citationMarkers) {
    // Find the sentence that precedes this citation
    const sentenceStart = findSentenceStart(text, marker.start);
    
    // Add non-highlighted text before the sentence
    if (sentenceStart > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, sentenceStart),
        isHighlighted: false
      });
    }
    
    // Add the highlighted sentence (without the citation marker)
    const sentenceEnd = marker.start;
    if (sentenceEnd > sentenceStart) {
      const sentenceText = text.substring(sentenceStart, sentenceEnd).trim();
      if (sentenceText) {
        segments.push({
          text: sentenceText,
          isHighlighted: true,
          citationId: marker.citation.id
        });
        
        references.push({
          citationId: marker.citation.id,
          inlineText: sentenceText,
          position: sentenceStart,
          highlightStart: sentenceStart,
          highlightEnd: sentenceEnd
        });
      }
    }
    
    // Skip the citation marker itself
    currentIndex = marker.end;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isHighlighted: false
    });
  }
  
  return { segments, references };
}

/**
 * Fallback parser for existing citations (original method)
 */
function parseTextWithExistingCitations(
  text: string,
  citations: Citation[]
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  let currentIndex = 0;
  
  for (const citation of citations) {
    const highlightText = citation.highlightedText || citation.content.substring(0, 100);
    
    // Try to find an exact match first (case insensitive)
    let matchIndex = text.toLowerCase().indexOf(highlightText.toLowerCase().substring(0, Math.min(50, highlightText.length)));
    
    // If no exact match, try fuzzy matching with key phrases
    if (matchIndex === -1) {
      const keyPhrases = extractKeyPhrases(highlightText);
      
      for (const phrase of keyPhrases) {
        if (phrase.length >= 15) {
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
 * Helper functions
 */
function findSentenceStart(text: string, fromIndex: number): number {
  // Look backwards for sentence delimiters
  const sentenceDelimiters = /[.!?]\s+/g;
  let lastDelimiterEnd = 0;
  
  let match;
  while ((match = sentenceDelimiters.exec(text)) !== null) {
    if (match.index + match[0].length >= fromIndex) {
      break;
    }
    lastDelimiterEnd = match.index + match[0].length;
  }
  
  return lastDelimiterEnd;
}

function extractSentenceBeforeCitation(text: string, citationIndex: number): string {
  const sentenceStart = findSentenceStart(text, citationIndex);
  return text.substring(sentenceStart, citationIndex).trim();
}

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