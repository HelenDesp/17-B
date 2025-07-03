// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// By not exporting a "runtime" variable, we default to the Node.js serverless runtime,
// which is compatible with the Google Cloud authentication libraries.

// Initialize the Vertex AI provider.
// It automatically reads the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const vertex = createGoogleVertexAI();

export default async function handler(req, res) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // The 'useChat' hook (which we'll use in the frontend) sends a 'messages' array.
    const { messages } = await req.json();
    
    // The last message from the user contains the NFT data in its 'data' property.
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    const nftData = lastUserMessage?.data;

    // If for some reason NFT data is missing, return an error.
    if (!nftData) {
      return res.status(400).json({ error: 'NFT data is missing from the request.' });
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

    // Use the .pipe() method to directly stream the AI
    // response to the Next.js API response object. This is the standard
    // and most reliable method for the Node.js runtime.
    result.pipe(res);
    
  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        details: error.message 
    });
  }
}
