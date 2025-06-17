/**
 * 🔗 Citation Parser - Enhanced Citation Processing for Real AI Chat
 * 
 * Converts AI responses into structured citations with text highlighting
 * for interactive source attribution.
 */

import { Citation, CitationReference, HighlightedText, SourceDiscovery } from '../types/index';

/**
 * Parse text and highlight cited content - Enhanced for inline citation format
 */
export function parseTextWithHighlighting(
  text: string,
  citations: Citation[],
  discoveries: SourceDiscovery[] = []
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  // First, try to parse inline citations [CITE:X]text[/CITE:X]
  const inlineCitationResult = parseInlineCitations(text);
  if (inlineCitationResult.segments.length > 0) {
    return inlineCitationResult;
  }

  // Fallback to citation markers [Source: ... | URL: ... | Date: ... | Confidence: ...]
  const citationMarkerResult = parseTextWithMarkers(text);
  if (citationMarkerResult.segments.length > 0) {
    return citationMarkerResult;
  }
  
  // Final fallback to existing citation matching
  return parseTextWithExistingCitations(text, citations);
}

/**
 * Parse inline citations in the format [CITE:X]text[/CITE:X] with simplified source references
 */
function parseInlineCitations(text: string): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  // const segments: HighlightedText[] = [];
  // const references: CitationReference[] = [];
  const extractedCitations: Citation[] = [];
  
  // First extract source references with simplified format: [Source:1] Title - URL (Date)
  const sourcePattern = /\[Source:(\d+)\]\s*([^-\n]+)\s*-\s*([^\s\n]+)\s*\(([^)]+)\)/g;
  const sources: Map<string, Citation> = new Map();
  
  let sourceMatch;
  while ((sourceMatch = sourcePattern.exec(text)) !== null) {
    const [, sourceId, title, url, date] = sourceMatch;
    
    const citation: Citation = {
      id: `inline-citation-${sourceId}`,
      source: title.trim(),
      type: determineSourceType(url.trim()),
      content: `Information from ${title.trim()}`,
      relevance: 0.8,
      url: url.trim(),
      timestamp: parseDate(date.trim()),
      confidence: 0.7,
      quality: calculateQualityFromUrl(url.trim()),
      highlightedText: ''
    };
    
    sources.set(sourceId, citation);
    extractedCitations.push(citation);
  }
  
  // Also try the old format for backwards compatibility
  const oldSourcePattern = /\[Source:(\d+)\s*\|\s*Title:\s*([^|]+)\s*\|\s*URL:\s*([^|]+)\s*\|\s*Date:\s*([^|]+)\s*\|\s*Confidence:\s*([^\]]+)\]/g;
  
  let oldSourceMatch;
  while ((oldSourceMatch = oldSourcePattern.exec(text)) !== null) {
    const [, sourceId, title, url, date, confidence] = oldSourceMatch;
    
    if (!sources.has(sourceId)) {
      const citation: Citation = {
        id: `inline-citation-${sourceId}`,
        source: title.trim(),
        type: determineSourceType(url.trim()),
        content: `Information from ${title.trim()}`,
        relevance: parseConfidence(confidence.trim()),
        url: url.trim(),
        timestamp: parseDate(date.trim()),
        confidence: parseConfidence(confidence.trim()),
        quality: calculateQualityFromUrl(url.trim()),
        highlightedText: ''
      };
      
      sources.set(sourceId, citation);
      extractedCitations.push(citation);
    }
  }
  
  // Remove source references from text for processing
  let cleanText = text.replace(sourcePattern, '').replace(oldSourcePattern, '').trim();
  
  // Try wrapped format first: [CITE:X]text[/CITE:X]
  const wrappedCitePattern = /\[CITE:(\d+)\](.*?)\[\/CITE:\d+\]/g;
  // let wrappedMatch;
  let hasWrappedCitations = false;
  
  // Check if we have wrapped citations
  const testResult = wrappedCitePattern.exec(cleanText);
  if (testResult !== null) {
    hasWrappedCitations = true;
  }
  
  if (hasWrappedCitations) {
    // Use the existing wrapped citation logic
    return parseWrappedCitations(cleanText, sources, extractedCitations);
  }
  
  // Handle simple end-of-sentence citations: [CITE:X]
  return parseEndOfSentenceCitations(cleanText, sources, extractedCitations);
}

/**
 * Parse wrapped citations [CITE:X]text[/CITE:X]
 */
function parseWrappedCitations(
  cleanText: string, 
  sources: Map<string, Citation>, 
  extractedCitations: Citation[]
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  const inlineCitePattern = /\[CITE:(\d+)\](.*?)\[\/CITE:\d+\]/g;
  const citationIds = new Set<string>();
  let lastIndex = 0;
  let match;
  
  // Collect citation IDs for fallbacks
  let tempMatch;
  const tempPattern = /\[CITE:(\d+)\]/g;
  while ((tempMatch = tempPattern.exec(cleanText)) !== null) {
    citationIds.add(tempMatch[1]);
  }
  
  // Create fallback citations
  citationIds.forEach(citationId => {
    if (!sources.has(citationId)) {
      const fallbackCitation: Citation = {
        id: `inline-citation-${citationId}`,
        source: `Research Source ${citationId}`,
        type: 'web',
        content: `Referenced information from source ${citationId}`,
        relevance: 0.7,
        url: `#source-${citationId}`,
        timestamp: new Date(),
        confidence: 0.6,
        quality: 0.5,
        highlightedText: ''
      };
      sources.set(citationId, fallbackCitation);
      extractedCitations.push(fallbackCitation);
    }
  });
  
  // Process wrapped citations
  while ((match = inlineCitePattern.exec(cleanText)) !== null) {
    const [fullMatch, sourceId, citedText] = match;
    
    if (match.index > lastIndex) {
      const beforeText = cleanText.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        segments.push({
          text: beforeText,
          isHighlighted: false
        });
      }
    }
    
    const citation = sources.get(sourceId);
    if (citation) {
      citation.highlightedText = citedText.trim();
      
      segments.push({
        text: citedText,
        isHighlighted: true,
        citationId: citation.id
      });
      
      references.push({
        citationId: citation.id,
        inlineText: citedText,
        position: match.index,
        highlightStart: match.index,
        highlightEnd: match.index + citedText.length
      });
    } else {
      segments.push({
        text: citedText,
        isHighlighted: false
      });
    }
    
    lastIndex = match.index + fullMatch.length;
  }
  
  if (lastIndex < cleanText.length) {
    const remainingText = cleanText.substring(lastIndex);
    if (remainingText.trim()) {
      segments.push({
        text: remainingText,
        isHighlighted: false
      });
    }
  }
  
  if (extractedCitations.length > 0) {
    (globalThis as any).__extractedCitations = extractedCitations;
  }
  
  return { segments, references };
}

/**
 * Parse end-of-sentence citations: [CITE:X] and highlight preceding text
 */
function parseEndOfSentenceCitations(
  cleanText: string, 
  sources: Map<string, Citation>, 
  extractedCitations: Citation[]
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  // Find all citation markers [CITE:X]
  const citationPattern = /\[CITE:(\d+)\]/g;
  const citationMatches: Array<{sourceId: string, index: number, length: number}> = [];
  let match;
  
  while ((match = citationPattern.exec(cleanText)) !== null) {
    citationMatches.push({
      sourceId: match[1],
      index: match.index!,
      length: match[0].length
    });
  }
  
  // Create fallback citations for missing sources
  const citationIds = new Set(citationMatches.map(m => m.sourceId));
  citationIds.forEach(citationId => {
    if (!sources.has(citationId)) {
      const fallbackCitation: Citation = {
        id: `inline-citation-${citationId}`,
        source: `Research Source ${citationId}`,
        type: 'web',
        content: `Referenced information from source ${citationId}`,
        relevance: 0.7,
        url: `#source-${citationId}`,
        timestamp: new Date(),
        confidence: 0.6,
        quality: 0.5,
        highlightedText: ''
      };
      sources.set(citationId, fallbackCitation);
      extractedCitations.push(fallbackCitation);
    }
  });
  
  if (citationMatches.length === 0) {
    // No citations found, return original text
    segments.push({
      text: cleanText,
      isHighlighted: false
    });
    return { segments, references };
  }
  
  // Sort citations by position
  citationMatches.sort((a, b) => a.index - b.index);
  
  // Remove citation markers to get clean text for processing
  const textWithoutCitations = cleanText.replace(citationPattern, '');
  
  let processedIndex = 0;
  
  citationMatches.forEach((citationMatch, citationIndex) => {
    const { sourceId, index: originalCitationStart } = citationMatch;
    
    // Calculate adjusted positions after removing previous citations
    let adjustedCitationStart = originalCitationStart;
    citationMatches.slice(0, citationIndex).forEach(prevCitation => {
      if (prevCitation.index < originalCitationStart) {
        adjustedCitationStart -= prevCitation.length;
      }
    });
    
    // Find the sentence boundary before this citation
    const textBeforeThisCitation = cleanText.substring(0, originalCitationStart);
    
    // Look for sentence start markers: period + space, start of text, or bullet point
    const sentenceMarkers = /[.!?]\s+|^|\n\s*[•\-*]\s*/g;
    let sentenceStart = 0;
    let sentenceMatch;
    
    while ((sentenceMatch = sentenceMarkers.exec(textBeforeThisCitation)) !== null) {
      sentenceStart = sentenceMatch.index + sentenceMatch[0].length;
    }
    
    // Adjust sentence start for removed citations
    let adjustedSentenceStart = sentenceStart;
    citationMatches.slice(0, citationIndex).forEach(prevCitation => {
      if (prevCitation.index < sentenceStart) {
        adjustedSentenceStart -= prevCitation.length;
      }
    });
    
    // Add any non-highlighted text before this sentence
    if (adjustedSentenceStart > processedIndex) {
      const beforeText = textWithoutCitations.substring(processedIndex, adjustedSentenceStart);
      if (beforeText.trim()) {
        segments.push({
          text: beforeText,
          isHighlighted: false
        });
      }
    }
    
    // Extract the text to highlight (from sentence start to citation)
    const textToHighlight = textWithoutCitations.substring(adjustedSentenceStart, adjustedCitationStart);
    
    // Add the highlighted text
    const citation = sources.get(sourceId);
    if (citation && textToHighlight.trim()) {
      citation.highlightedText = textToHighlight.trim();
      
      segments.push({
        text: textToHighlight,
        isHighlighted: true,
        citationId: citation.id
      });
      
      references.push({
        citationId: citation.id,
        inlineText: textToHighlight.trim(),
        position: adjustedSentenceStart,
        highlightStart: adjustedSentenceStart,
        highlightEnd: adjustedCitationStart
      });
    }
    
    processedIndex = adjustedCitationStart;
  });
  
  // Add any remaining text after the last citation
  if (processedIndex < textWithoutCitations.length) {
    const remainingText = textWithoutCitations.substring(processedIndex);
    if (remainingText.trim()) {
      segments.push({
        text: remainingText,
        isHighlighted: false
      });
    }
  }
  
  if (extractedCitations.length > 0) {
    (globalThis as any).__extractedCitations = extractedCitations;
  }
  
  return { segments, references };
}

/**
 * Parse text that contains citation markers (legacy format)
 */
function parseTextWithMarkers(text: string): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  // Extract citation markers and replace them with placeholders
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
  
  // Process citation markers if found
  if (citationMarkers.length > 0) {
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

// Debug function to test citation parsing
export function testCitationParsing() {
  const testText = `Superposition: Qubits can exist in a state of superposition, meaning they can represent 0, 1, or both simultaneously . [CITE:3]Formally, a qubit is a unit vector in a two-dimensional complex vector space. This allows quantum computers to explore many possibilities concurrently.`;

  console.log('Testing end-of-sentence citation parsing...');
  console.log('Input text:', testText);
  
  const result = parseTextWithHighlighting(testText, []);
  console.log('Parsed result:', result);
  console.log('Number of segments:', result.segments.length);
  console.log('Number of highlighted segments:', result.segments.filter((s: HighlightedText) => s.isHighlighted).length);
  
  // Log each segment with more detail
  result.segments.forEach((segment: HighlightedText, index: number) => {
    console.log(`Segment ${index + 1}:`, {
      text: segment.text,
      isHighlighted: segment.isHighlighted,
      citationId: segment.citationId || 'none',
      length: segment.text.length
    });
  });
  
  // Check if citations were created globally
  const extractedCitations = (globalThis as any).__extractedCitations || [];
  console.log('Number of extracted citations:', extractedCitations.length);
  
  extractedCitations.forEach((citation: Citation, index: number) => {
    console.log(`Citation ${index + 1}:`, {
      id: citation.id,
      source: citation.source,
      url: citation.url,
      highlightedText: citation.highlightedText
    });
  });
  
  return { result, extractedCitations };
} 