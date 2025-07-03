// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// IMPORTANT: Set the runtime to 'edge' for best performance with streaming.
// This is the standard for the Vercel AI SDK.
export const runtime = 'edge';

// Initialize the Vertex AI provider.
// It automatically reads the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const vertex = createGoogleVertexAI();

export default async function handler(req) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // The 'useChat' hook sends a 'messages' array.
    const { messages } = await req.json();
    
    // The last message from the user contains the NFT data in its 'data' property.
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    const nftData = lastUserMessage?.data;

    if (!nftData) {
      throw new Error('NFT data is missing from the request.');
    }

    // Create a system prompt to give the AI context about its role and the NFT.
    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftData.name}".

Here are its traits, use them to inform your conversation:
- Manifesto: ${nftData.manifesto}
- Friend: ${nftData.friend}
- Weapon: ${nftData.weapon}

Engage the user in a conversation about their NFT. Be friendly, imaginative, and stay in character. Keep responses concise but meaningful.`;

    // Call the streamText model from the Vercel AI SDK
    const result = await streamText({
      model: vertex('gemini-1.5-flash-001'),
      system: systemPrompt,
      messages,
    });

    // Respond with the stream. The .toAIStreamResponse() is the correct method for Edge functions.
    return result.toAIStreamResponse();

  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
