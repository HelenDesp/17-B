// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// Initialize the Vertex AI provider.
// It automatically reads the environment variables you set up in Vercel.
const vertex = createGoogleVertexAI();

// This is the handler for the /api/chat endpoint in the Pages Router
// It uses the standard Node.js serverless runtime by default.
export default async function handler(req, res) {
  // Use a switch statement to explicitly handle the POST method
  switch (req.method) {
    case 'POST':
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

        // Respond with the stream. The .pipe() method is used for the Node.js runtime.
        return result.pipe(res);

      } catch (error) {
        // Handle any potential errors
        console.error("Error in chat API route:", error);
        return res.status(500).json({ error: 'An error occurred while processing your request.' });
      }

    // If the method is not POST, return a 405 error
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
