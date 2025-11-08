/**
 * Cloudflare Pages Function for API endpoints
 * This handles all /api/* routes for the medical instruction simplifier
 * 
 * Routes:
 * - POST /api/simplify - Simplify medical instructions
 * - POST /api/upload - Upload and extract text from files
 * - GET /api/health - Health check
 */

// System prompt for OpenAI
const SYSTEM_PROMPT = `You are a medical education assistant.
Your job is to rephrase medical or device instructions into plain, easy-to-understand language.
- Use simple terms and short sentences.
- Define medical words using reputable sources like WebMD or Harvard Health.
- Never remove or change safety warnings.
- Never give personal medical advice or make recommendations.
- If a step seems unclear, say: "Ask your healthcare provider for clarification."
- Always include: (Source: Educational summary, not medical advice.)`;

/**
 * Simplify medical instructions using OpenAI
 */
async function simplifyInstructions(text, apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    // Security: Don't expose API key in error messages
    let errorMsg = error.message || 'Unknown error';
    if (apiKey && errorMsg.includes(apiKey)) {
      errorMsg = errorMsg.replace(apiKey, '***REDACTED***');
    }
    throw new Error(`Error calling OpenAI API: ${errorMsg}`);
  }
}

/**
 * Extract text from uploaded file
 * Note: PDF parsing is limited in Pages Functions - we'll handle text files primarily
 */
async function extractTextFromFile(file, filename) {
  const fileExtension = filename.toLowerCase().split('.').pop();
  const textExtensions = ['txt', 'md', 'csv'];
  
  if (textExtensions.includes(fileExtension)) {
    // Read text files
    const text = await file.text();
    return text;
  } else if (fileExtension === 'pdf') {
    // PDFs should be handled client-side before reaching this function
    // This is a fallback in case a PDF somehow reaches the API
    throw new Error('PDF files should be processed client-side. If you see this error, please try uploading the PDF again.');
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}. Supported types: ${textExtensions.join(', ')}, pdf`);
  }
}

/**
 * Handle CORS headers
 */
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

/**
 * Main Pages Function handler
 */
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: getCorsHeaders(),
    });
  }

  try {
    // Health check endpoint
    if (pathname === '/api/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'healthy' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        }
      );
    }

    // Simplify endpoint
    if (pathname === '/api/simplify' && request.method === 'POST') {
      const apiKey = env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'OPENAI_API_KEY is not configured',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }

      // Validate API key format
      if (!apiKey.startsWith('sk-')) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid API key format',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }

      const body = await request.json();
      const text = body.text;

      if (!text || !text.trim()) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No text provided',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }

      const simplified = await simplifyInstructions(text, apiKey);

      return new Response(
        JSON.stringify({
          success: true,
          result: simplified,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(),
          },
        }
      );
    }

    // File upload endpoint
    if (pathname === '/api/upload' && request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No file provided',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }

      const filename = file.name || 'unknown';
      const allowedExtensions = ['.txt', '.md', '.pdf', '.csv'];
      const fileExtension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExtension)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `File type not supported. Please upload: ${allowedExtensions.join(', ')}`,
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }

      try {
        const textContent = await extractTextFromFile(file, filename);

        if (!textContent || !textContent.trim()) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'File appears to be empty or could not be read',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...getCorsHeaders(),
              },
            }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            text: textContent,
            filename: filename,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message || 'Error processing file',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(),
            },
          }
        );
      }
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Not found',
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      }
    );
  } catch (error) {
    console.error('Pages Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(),
        },
      }
    );
  }
}

