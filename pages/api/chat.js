// app/api/chat/route.js (Alternative simplified version)
export async function POST(request) {
  try {
    console.log('Chat API called');
    
    const body = await request.json();
    console.log('Request body received');
    
    const { message, nftData, chatHistory } = body;

    if (!message || !nftData) {
      console.error('Missing required fields');
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, return a simple response to test the API
    const response = `Hello! I'm ${nftData.name} (Token #${nftData.tokenId}). You said: "${message}". My manifesto is: ${nftData.manifesto}. This is a test response while we debug the Vertex AI integration.`;

    console.log('Sending response');
    return Response.json({ response });

  } catch (error) {
    console.error('Detailed error:', error);
    
    return Response.json(
      { 
        error: 'Failed to generate response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}