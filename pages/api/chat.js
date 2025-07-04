// app/api/chat/route.js (for App Router - Next.js 13+)
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

export async function POST(request) {
  try {
    console.log('Chat API called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { message, nftData, chatHistory } = body;

    if (!message || !nftData) {
      console.error('Missing required fields:', { message: !!message, nftData: !!nftData });
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the system prompt based on NFT data
    const systemPrompt = `You are ${nftData.name}, a unique NFT character from the ReVerse Genesis collection. Here are your characteristics:

Name: ${nftData.name}
Token ID: ${nftData.tokenId}
Manifesto: ${nftData.manifesto}
Friend: ${nftData.friend}
Weapon: ${nftData.weapon}

You should embody this character and respond in character. Be creative, engaging, and reflect the personality suggested by your traits. Keep responses conversational and interesting, drawing from your manifesto, mentioning your friend when relevant, and occasionally referencing your weapon if it fits the conversation context.

Stay in character at all times and make the conversation feel like you're truly this NFT character coming to life.`;

    // Convert chat history to the format expected by the AI SDK
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling Vertex AI with messages:', messages.length);

    // Initialize Vertex AI with explicit configuration
    const model = vertex('gemini-2.0-flash', {
      project: process.env.GOOGLE_VERTEX_PROJECT_ID || 'tough-cipher-464318-q0',
      location: process.env.GOOGLE_VERTEX_LOCATION || 'us-central1',
    });

    // Generate response using Vertex AI
    const { text } = await generateText({
      model,
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    console.log('AI Response generated successfully');
    return Response.json({ response: text });

  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return Response.json(
      { 
        error: 'Failed to generate response',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// For Pages Router (Next.js 12 and below)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, nftData, chatHistory } = req.body;

    // Create the system prompt based on NFT data
    const systemPrompt = `You are ${nftData.name}, a unique NFT character from the ReVerse Genesis collection. Here are your characteristics:

Name: ${nftData.name}
Token ID: ${nftData.tokenId}
Manifesto: ${nftData.manifesto}
Friend: ${nftData.friend}
Weapon: ${nftData.weapon}

You should embody this character and respond in character. Be creative, engaging, and reflect the personality suggested by your traits. Keep responses conversational and interesting, drawing from your manifesto, mentioning your friend when relevant, and occasionally referencing your weapon if it fits the conversation context.

Stay in character at all times and make the conversation feel like you're truly this NFT character coming to life.`;

    // Convert chat history to the format expected by the AI SDK
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Generate response using Vertex AI
    const { text } = await generateText({
      model: vertex('gemini-2.0-flash'),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error with Vertex AI:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}