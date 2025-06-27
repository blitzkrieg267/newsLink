interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  promptFeedback?: any;
  usageMetadata?: any;
  modelVersion?: string;
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
  published_date?: string;
}

interface TavilyResponse {
  answer: string;
  query: string;
  response_time: number;
  images?: Array<{
    url: string;
    description: string;
  }>;
  results: TavilySearchResult[];
}

interface MultiAgentResponse {
  source: 'gemini' | 'tavily';
  answer: string;
  query: string;
  response_time: number;
  results?: TavilySearchResult[];
  raw_response?: any;
}

const PICA_SECRET_KEY = 'sk_test_1_go5-yJMWA-RWq-rT8_19Qo2oeM21CWTuixQ7XKQ0q4-kvUHTcOIVR779siEdaWMfGf2XCKAZLIzCc5-J7EsJFv_R0Ep6v8LFSxml53TOrQDdocE5fZmzNiVLImpYHe4h240vxowNRdRMgSnvR_YX9JvWgweu9p_id_yRnek1ZYrlKkcxtbAZa5E7-mk0k-7of3dYxtO4nD6Kkh0sOx5Qu8rabRZjS-AP_D0fOOTQBQ';
const PICA_GEMINI_CONNECTION_KEY = 'test::gemini::default::5c1e6a7570cb4a4e8a2b60f7de36f2ba';
const PICA_TAVILY_CONNECTION_KEY = 'test::tavily::default::5110904260e243cba177fc39ab0a127f';

// Helper function to detect if Gemini response is a fallback/error
function isGeminiFallback(geminiData: GeminiResponse): boolean {
  if (!geminiData.candidates || geminiData.candidates.length === 0) {
    return true;
  }
  
  const content = geminiData.candidates[0]?.content?.parts?.[0]?.text?.toLowerCase() || '';
  
  // Check for common fallback indicators
  const fallbackIndicators = [
    'i cannot',
    'i am unable',
    'i don\'t have access',
    'i cannot access',
    'i don\'t have real-time',
    'i cannot provide real-time',
    'i cannot browse',
    'i don\'t have the ability',
    'error',
    'fallback',
    'unable to search',
    'cannot search the web',
    'no access to current',
    'cannot access current'
  ];
  
  return fallbackIndicators.some(indicator => content.includes(indicator));
}

async function searchWithGemini(query: string): Promise<MultiAgentResponse | null> {
  try {
    const startTime = Date.now();
    
    const systemPrompt = `You are an AI news and current affairs search assistant with real-time web access. Given a user query, provide a concise, objective, and up-to-date answer using your web and news search capabilities. 

IMPORTANT: If you are unable to access current information, search the web, or provide real-time news updates, you MUST explicitly state "I cannot access current information" or "I am unable to search the web" so that the application can seamlessly switch to another AI agent.

Only provide answers if you have access to current, real-time information. Do not provide outdated or general knowledge responses for news queries.

User Query: ${query}`;

    const response = await fetch('https://api.picaos.com/v1/passthrough/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_GEMINI_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCmd5BQE388::PISTzTbvRSqXx0N0rMa-Lw',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ]
          }
        ],
        generationConfig: {
          candidateCount: 1,
          maxOutputTokens: 512,
          temperature: 0.2
        }
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API request failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const responseTime = (Date.now() - startTime) / 1000;

    // Check if this is a fallback response
    if (isGeminiFallback(data)) {
      console.log('Gemini returned fallback response, switching to Tavily');
      return null;
    }

    const answer = data.candidates[0]?.content?.parts?.[0]?.text || '';
    
    if (!answer.trim()) {
      console.log('Gemini returned empty response, switching to Tavily');
      return null;
    }

    return {
      source: 'gemini',
      answer,
      query,
      response_time: responseTime,
      raw_response: data
    };
  } catch (error) {
    console.warn('Gemini search failed:', error);
    return null;
  }
}

export async function searchWithGeminiOnly(query: string): Promise<MultiAgentResponse> {
  console.log(`Starting Gemini-only search for: "${query}"`);
  
  const geminiResult = await searchWithGemini(query);
  
  if (geminiResult) {
    console.log('Gemini search successful');
    return geminiResult;
  }
  
  // If Gemini fails, throw an error instead of falling back
  throw new Error('Gemini AI is unable to access current information for this query. Please enable Tavily fallback for enhanced search capabilities.');
}

async function searchWithTavily(query: string): Promise<MultiAgentResponse> {
  try {
    const startTime = Date.now();
    
    const response = await fetch('https://api.picaos.com/v1/passthrough/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': PICA_SECRET_KEY,
        'x-pica-connection-key': PICA_TAVILY_CONNECTION_KEY,
        'x-pica-action-id': 'conn_mod_def::GCMZGXIH9aE::u-LjTRVgSdC0O_VGbS317w',
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        topic: 'news',
        max_results: 8,
        include_answer: 'basic',
        include_images: true,
        days: 7
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API request failed: ${response.status} ${response.statusText}`);
    }

    const data: TavilyResponse = await response.json();
    const responseTime = (Date.now() - startTime) / 1000;

    return {
      source: 'tavily',
      answer: data.answer || 'No summary available',
      query: data.query,
      response_time: responseTime,
      results: data.results || [],
      raw_response: data
    };
  } catch (error) {
    console.error('Tavily search failed:', error);
    throw new Error('Failed to search news. Please try again.');
  }
}

export async function multiAgentNewsSearch(query: string): Promise<MultiAgentResponse> {
  console.log(`Starting multi-agent search for: "${query}"`);
  
  // 1. Try Gemini first
  console.log('Attempting search with Gemini...');
  const geminiResult = await searchWithGemini(query);
  
  if (geminiResult) {
    console.log('Gemini search successful');
    return geminiResult;
  }
  
  // 2. Fallback to Tavily
  console.log('Gemini failed or returned fallback, switching to Tavily...');
  const tavilyResult = await searchWithTavily(query);
  console.log('Tavily search successful');
  
  return tavilyResult;
}

export function getCategoryQuery(category: string): string {
  const categoryQueries: Record<string, string> = {
    'World Events': 'latest world news global developments international affairs current events',
    'Politics': 'political news government elections policy latest political updates',
    'Technology': 'latest technology news AI software development cybersecurity tech trends',
    'Business': 'business news finance markets economy corporate earnings stock market',
    'Health': 'health news medical research wellness fitness nutrition healthcare',
    'Science': 'science news research discoveries climate space exploration scientific breakthroughs',
    'Sports': 'sports news football basketball soccer tennis latest scores championships',
    'Entertainment': 'entertainment news movies music celebrities hollywood awards shows',
  };

  return categoryQueries[category] || 'latest breaking news current events worldwide';
}