/**
 * 🤖 Gemini AI Service - Real AI Chat with Citations
 * 
 * Integrates with Google's Gemini 2.0 Flash model (standard version) to provide
 * AI responses with proper source citations and fact-checking.
 */

import { Citation, ChatMessage, SourceDiscovery } from '../types/index';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  content: string;
  citations: Citation[];
  confidence: number;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class GeminiService {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    this.config = {
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 2048,
      ...config
    };
  }

  /**
   * Send a chat message and get response with citations
   */
  async sendMessage(
    message: string,
    context?: ChatMessage[],
    includeCitations = true
  ): Promise<GeminiResponse> {
    try {
      const prompt = this.buildPromptWithCitations(message, context, includeCitations);
      
      const response = await fetch(
        `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: this.config.temperature,
              maxOutputTokens: this.config.maxTokens,
              candidateCount: 1,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGeminiResponse(data, message);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to get response from Gemini: ${error}`);
    }
  }

  /**
   * Build a prompt that encourages citation of sources
   */
  private buildPromptWithCitations(
    message: string,
    context?: ChatMessage[],
    includeCitations = true
  ): string {
    let prompt = '';

    // Add context from previous messages
    if (context && context.length > 0) {
      prompt += 'Previous conversation context:\n';
      context.slice(-3).forEach(msg => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    if (includeCitations) {
      prompt += `You are a helpful AI assistant that provides accurate, well-sourced information with professional formatting. 

FORMATTING REQUIREMENTS:
1. Use clear section headers with ## for main topics and ### for subtopics
2. Use bullet points (•) for lists and key points
3. Use **bold** for important terms and concepts
4. Use *italics* for emphasis and examples
5. Structure your response with clear sections and proper spacing

CITATION REQUIREMENTS - CRITICAL FOR ACCURACY:
When you reference information from sources, you MUST cite at the end of sentences or claims.

**SIMPLE CITATION FORMAT:**
Use this exact format for citing sources:

1. Add citations at the end of sentences: "Information here [CITE:1]."
2. List sources at the end: [Source:1] Title - URL (Date)

**EXAMPLE:**
## **Game Ratings**

### **ESRB Ratings (North America)**

• *The Legend of Zelda: Breath of the Wild*: Rated E10+ for Everyone 10 and older [CITE:1]. The content descriptors include Fantasy Violence and Mild Suggestive Themes [CITE:1].

• *The Legend of Zelda: Tears of the Kingdom*: Rated E10+ for Everyone 10 and older [CITE:2]. It contains similar content descriptors [CITE:2].

**Sources:**
[Source:1] ESRB Game Ratings - https://www.esrb.org (2023-03-15)
[Source:2] Nintendo Game Information - https://nintendo.com (2023-05-10)

**CRITICAL RULES:**
1. Place [CITE:X] at the END of sentences or claims that come from sources
2. Use consecutive numbers (1, 2, 3...) for each source
3. Always include source list at the end with real URLs when possible
4. If you don't have real sources, don't use citations - just provide information
5. Each cited sentence should have clear, factual information from the source

Please provide comprehensive, well-structured answers with precise source attribution for the following question:

${message}

Remember:
- Only cite information you can verify from real sources
- Use [CITE:X] at the end of cited sentences
- Include source list at the end
- Use professional formatting with headers and sections`;
    } else {
      prompt += `User: ${message}\n\nAssistant:`;
    }

    return prompt;
  }

  /**
   * Parse Gemini's response and extract citations
   */
  private parseGeminiResponse(data: any, originalQuery: string): GeminiResponse {
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const citations = this.extractCitationsFromResponse(content, originalQuery);
    
    return {
      content: this.cleanResponseContent(content),
      citations,
      confidence: this.calculateResponseConfidence(data),
      model: this.config.model || 'gemini-2.0-flash',
      usage: this.extractUsageInfo(data)
    };
  }

  /**
   * Extract citation information from Gemini's response
   */
  private extractCitationsFromResponse(content: string, query: string): Citation[] {
    const citations: Citation[] = [];
    const sourcePattern = /\[Source:\s*([^|]+)\s*\|\s*URL:\s*([^|]+)\s*\|\s*Date:\s*([^|]+)\s*\|\s*Confidence:\s*([^\]]+)\]/g;
    
    let match;
    let citationId = 1;

    while ((match = sourcePattern.exec(content)) !== null) {
      const [fullMatch, title, url, date, confidence] = match;
      
      citations.push({
        id: `citation-${citationId++}`,
        source: title.trim(),
        type: this.determineSourceType(url.trim()),
        content: `Information from ${title.trim()}`,
        relevance: this.calculateRelevance(confidence.trim()),
        url: url.trim(),
        timestamp: this.parseDate(date.trim()),
        confidence: this.parseConfidence(confidence.trim()),
        quality: this.calculateQuality(title.trim(), url.trim()),
        highlightedText: this.extractRelevantText(content, fullMatch)
      });
    }

    // If no explicit citations found, try to extract URLs and create basic citations
    if (citations.length === 0) {
      const urlPattern = /https?:\/\/[^\s)]+/g;
      const urls = content.match(urlPattern) || [];
      
      urls.forEach((url, index) => {
        citations.push({
          id: `auto-citation-${index + 1}`,
          source: this.extractDomainName(url),
          type: this.determineSourceType(url),
          content: `Referenced source: ${url}`,
          relevance: 0.7,
          url: url,
          timestamp: new Date(),
          confidence: 0.6,
          quality: 0.7
        });
      });
    }

    return citations;
  }

  /**
   * Clean the response content by removing citation markers
   */
  private cleanResponseContent(content: string): string {
    return content
      .replace(/\[Source:[^\]]+\]/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }

  /**
   * Helper methods for citation processing
   */
  private determineSourceType(url: string): Citation['type'] {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
    if (url.includes('.pdf')) return 'pdf';
    if (url.includes('spotify.com') || url.includes('soundcloud.com')) return 'audio';
    if (url.includes('.jpg') || url.includes('.png') || url.includes('.gif')) return 'image';
    if (url.includes('arxiv.org') || url.includes('docs.') || url.includes('.doc')) return 'document';
    return 'web';
  }

  private calculateRelevance(confidence: string): number {
    switch (confidence.toLowerCase()) {
      case 'high': return 0.9;
      case 'medium': return 0.7;
      case 'low': return 0.5;
      default: return 0.6;
    }
  }

  private parseConfidence(confidence: string): number {
    return this.calculateRelevance(confidence);
  }

  private calculateQuality(title: string, url: string): number {
    let quality = 0.5;
    
    // Higher quality for academic sources
    if (url.includes('arxiv.org') || url.includes('scholar.google.com')) quality += 0.3;
    if (url.includes('.edu') || url.includes('.gov')) quality += 0.2;
    if (title.length > 10) quality += 0.1;
    
    return Math.min(quality, 1.0);
  }

  private parseDate(dateStr: string): Date {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private extractDomainName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }

  private extractRelevantText(content: string, citationMarker: string): string {
    const index = content.indexOf(citationMarker);
    if (index === -1) return '';
    
    // Extract surrounding sentence
    const start = Math.max(0, content.lastIndexOf('.', index) + 1);
    const end = content.indexOf('.', index + citationMarker.length);
    
    return content.substring(start, end > -1 ? end : content.length).trim();
  }

  private calculateResponseConfidence(data: any): number {
    // Basic confidence calculation based on response metadata
    const safetyRatings = data.candidates?.[0]?.safetyRatings || [];
    const hasHighSafetyRatings = safetyRatings.every((rating: any) => 
      rating.probability === 'NEGLIGIBLE' || rating.probability === 'LOW'
    );
    
    return hasHighSafetyRatings ? 0.8 : 0.6;
  }

  private extractUsageInfo(data: any) {
    const usage = data.usageMetadata;
    if (!usage) return undefined;
    
    return {
      promptTokens: usage.promptTokenCount || 0,
      completionTokens: usage.candidatesTokenCount || 0,
      totalTokens: usage.totalTokenCount || 0
    };
  }

  /**
   * Search for sources related to a query
   */
  async searchSources(query: string): Promise<SourceDiscovery> {
    const response = await this.sendMessage(
      `Find and cite 3-5 reliable sources about: ${query}. For each source, provide the title, URL, and a brief explanation of why it's relevant.`,
      undefined,
      true
    );

    return {
      query,
      timestamp: new Date(),
      results: response.citations,
      confidence: response.confidence,
      context: response.content,
      searchMethod: 'semantic'
    };
  }

  /**
   * Generate chat response using sendMessage with enhanced formatting
   */
  async generateChatResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<{
    content: string;
    citations: Citation[];
    confidence: number;
  }> {
    try {
      // Use the existing sendMessage method
      const response = await this.sendMessage(userMessage, conversationHistory, true);
      
      // Enhanced content formatting
      const enhancedContent = this.enhanceContentFormatting(response.content);
      
      return {
        content: enhancedContent,
        citations: response.citations,
        confidence: response.confidence
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhanced content formatting with better markdown and findings handling
   */
  private enhanceContentFormatting(content: string): string {
    let formatted = content;

    // Hide the word "finding" with bold formatting (**finding** becomes **discovery**)
    formatted = formatted.replace(/\*\*(finding|findings)\*\*/gi, '**discovery**');
    formatted = formatted.replace(/\b(finding|findings)\b/gi, '**discovery**');
    
    // Enhanced section header formatting
    formatted = formatted.replace(/^(#{1,6})\s*(.+)$/gm, (match, hashes, title) => {
      return `${hashes} **${title.trim()}**`;
    });
    
    // Better bullet point formatting with consistent spacing
    formatted = formatted.replace(/^\* /gm, '• ');
    formatted = formatted.replace(/^- /gm, '• ');
    formatted = formatted.replace(/^\+ /gm, '• ');
    
    // Enhanced numbered lists with better spacing
    formatted = formatted.replace(/^(\d+)\.\s+/gm, '$1. ');
    
    // Special formatting for key sections
    formatted = formatted.replace(/\*\*(General Trends & Key Developments|Specific Recent Developments|Key Developments|Recent Developments)\*\*/gi, '## **$1**');
    formatted = formatted.replace(/\*\*(Confidence Levels?|Disclaimer|Note|Important)\*\*/gi, '### **$1**');
    
    // Format confidence and disclaimer sections with callout styling
    formatted = formatted.replace(/(### \*\*Confidence Levels?\*\*[\s\S]*?)(?=\n### |\n## |$)/g, (match) => {
      return `\n---\n\n${match.trim()}\n\n---\n`;
    });
    
    formatted = formatted.replace(/(### \*\*Disclaimer\*\*[\s\S]*?)(?=\n### |\n## |$)/g, (match) => {
      return `\n---\n\n${match.trim()}\n\n---\n`;
    });
    
    // Enhanced bold and italic formatting
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    formatted = formatted.replace(/\*([^*]+)\*/g, '*$1*');
    
    // Better spacing around sections
    formatted = formatted.replace(/^(#{1,6})/gm, '\n$1');
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // Clean up and structure
    formatted = formatted.trim();
    
    return formatted;
  }
}

export default GeminiService; 