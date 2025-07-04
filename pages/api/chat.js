// app/api/chat/route.js (Using Google AI SDK directly)
import { GoogleAuth } from 'google-auth-library';

export async function POST(request) {
  try {
    console.log('Chat API called');
    
    const body = await request.json();
    const { message, nftData, chatHistory } = body;

    if (!message || !nftData) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the system prompt
    const systemPrompt = `You are ${nftData.name}, a unique NFT character from the ReVerse Genesis collection. Here are your characteristics:

Name: ${nftData.name}
Token ID: ${nftData.tokenId}
Manifesto: ${nftData.manifesto}
Friend: ${nftData.friend}
Weapon: ${nftData.weapon}

You should embody this character and respond in character. Be creative, engaging, and reflect the personality suggested by your traits. Keep responses conversational and interesting. Stay in character at all times.`;

    // Prepare the conversation history
    let conversationText = systemPrompt + '\n\n';
    
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          conversationText += `Human: ${msg.content}\n`;
        } else {
          conversationText += `${nftData.name}: ${msg.content}\n`;
        }
      });
    }
    
    conversationText += `Human: ${message}\n${nftData.name}:`;

    // Set up Google Auth
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const authClient = await auth.getClient();
    const projectId = process.env.GOOGLE_VERTEX_PROJECT_ID || 'tough-cipher-464318-q0';
    const location = process.env.GOOGLE_VERTEX_LOCATION || 'us-central1';

    // Make direct API call to Vertex AI
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash:generateContent`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: conversationText
        }]
      }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    };

    const response = await authClient.request({
      url,
      method: 'POST',
      data: requestBody,
    });

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return Response.json({ response: aiResponse });

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