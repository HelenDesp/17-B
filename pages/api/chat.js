// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText, StreamingTextResponse } from 'ai';

// By not exporting a "runtime" variable, we default to the Node.js serverless runtime,
// which is compatible with the Google Cloud authentication libraries.

// Initialize the Vertex AI provider.
const vertex = createGoogleVertexAI();

// This is the handler for the /api/chat endpoint.
export default async function handler(req, res) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Extract the `messages` and `data` from the request body
    const { messages, data } = await req.json();
    const { nftName, nftTraits } = data; // Get NFT data sent from the frontend

    // Create a system prompt to give the AI context about its role and the NFT.
    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftName}".

Here are its traits, use them to inform your conversation: ${JSON.stringify(nftTraits, null, 2)}.

Engage the user in a conversation about their NFT. You can talk about its lore, suggest creative stories, discuss its traits, or even role-play as the character. Be friendly, imaginative, and stay in character.`;

    // Call the streamText model from the Vercel AI SDK
    const result = await streamText({
      model: vertex('gemini-1.5-flash-001'),
      system: systemPrompt,
      messages,
    });

    // Create a StreamingTextResponse to properly handle the stream.
    // This is the key change to ensure compatibility with Vercel's environment.
    const stream = result.toAIStream();
    const response = new StreamingTextResponse(stream);

    // Manually pipe the response to the res object for the Pages Router.
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    });

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res.write(value);
    }
    res.end();
    
  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
