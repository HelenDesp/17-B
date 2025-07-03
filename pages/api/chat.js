// pages/api/chat.js

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

// By not exporting a "runtime" variable, we default to the Node.js serverless runtime.
// This is compatible with the Google Cloud authentication libraries.

// Initialize the Vertex AI provider.
// It automatically reads the GOOGLE_APPLICATION_CREDENTIALS environment variable once it's correctly formatted.
const vertex = createGoogleVertexAI();

export default async function handler(req, res) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Your frontend sends 'message', 'nftData', and 'chatHistory'. We'll use them.
    const { message, nftData, chatHistory = [] } = await req.json();

    // Reformat the incoming data for the generateText function
    const messages = [
      ...chatHistory.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    // Create a system prompt to give the AI context about its role and the NFT.
    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftData.name}".

Here are its traits, use them to inform your conversation:
- Manifesto: ${nftData.manifesto}
- Friend: ${nftData.friend}
- Weapon: ${nftData.weapon}

Engage the user in a conversation about their NFT. Be friendly, imaginative, and stay in character. Keep responses concise but meaningful.`;

    // Call the generateText model from the Vercel AI SDK.
    // This function waits for the full response and returns it as a single object.
    const result = await generateText({
      model: vertex('gemini-1.5-flash-001'),
      system: systemPrompt,
      messages,
    });

    // Send the AI's text response back to your frontend.
    // This matches the format your NFTViewer.js expects.
    res.status(200).json({ response: result.text });

  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        details: error.message 
    });
  }
}
