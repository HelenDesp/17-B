// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// By not exporting a "runtime" variable, we default to the Node.js serverless runtime,
// which is compatible with the Google Cloud authentication libraries.

// Initialize the Vertex AI provider.
const vertex = createGoogleVertexAI();

// This is the handler for the /api/chat endpoint.
export default async function handler(req, res) {
  // Explicitly handle only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
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

    // Set headers for streaming the response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Manually iterate over the stream and write chunks to the response.
    // This is a robust method for handling streams in a Node.js environment.
    for await (const chunk of result.textStream) {
      res.write(chunk);
    }

    // End the response when the stream is finished
    res.end();

  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
