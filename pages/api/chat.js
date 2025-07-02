// src/app/api/chat/route.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize the Vertex AI provider.
// It automatically reads the environment variables you set up in Vercel.
const vertex = createGoogleVertexAI();

export async function POST(req) {
  try {
    // Extract the `messages` and `data` from the request body
    const { messages, data } = await req.json();
    const { nftName, nftTraits } = data; // Get NFT data sent from the frontend

    // Create a system prompt to give the AI context about its role and the NFT.
    // This is where you can get creative and define the AI's personality.
    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftName}".

Here are its traits, use them to inform your conversation: ${JSON.stringify(nftTraits, null, 2)}.

Engage the user in a conversation about their NFT. You can talk about its lore, suggest creative stories, discuss its traits, or even role-play as the character. Be friendly, imaginative, and stay in character.`;

    // Call the streamText model from the Vercel AI SDK
    const result = await streamText({
      // Use the Gemini 1.5 Flash model for fast responses
      model: vertex('gemini-1.5-flash-001'),
      // Provide the system prompt to define the AI's behavior
      system: systemPrompt,
      // Pass the existing conversation history
      messages,
    });

    // Respond with the stream
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
