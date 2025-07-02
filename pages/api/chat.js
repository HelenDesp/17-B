/*
  OPTION 1: If your file is located at 'pages/api/chat.js'
  (For the Next.js Pages Router)
  
  Copy and paste this entire code block into your 'pages/api/chat.js' file.
*/

import { createGoogleVertexAI } from '@ai-sdk/google-vertex';
import { streamText } from 'ai';

// Initialize the Vertex AI provider.
const vertex = createGoogleVertexAI();

export default async function handler(req, res) {
  // Check for POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, data } = await req.json();
    const { nftName, nftTraits } = data;

    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftName}".
Here are its traits: ${JSON.stringify(nftTraits, null, 2)}.
Engage the user in a conversation about their NFT. Be friendly, imaginative, and stay in character.`;

    const result = await streamText({
      model: vertex('gemini-1.5-flash-001'),
      system: systemPrompt,
      messages,
    });

    // This is the standard way to pipe the stream to the response in the Pages Router.
    result.pipe(res);

  } catch (error) {
    console.error("Error in chat API route:", error);
    return res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}