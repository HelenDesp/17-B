// pages/api/chat.js

// Import the official Google Cloud library
import { VertexAI } from '@google-cloud/vertexai';

// Initialize the VertexAI client.
// It will automatically use the GOOGLE_APPLICATION_CREDENTIALS from your Vercel environment.
const vertex_ai = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

// Select the Gemini model
const model = vertex_ai.getGenerativeModel({
  model: 'gemini-1.5-flash-001',
});

export default async function handler(req, res) {
  // We only want to handle POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { message, nftData, chatHistory = [] } = await req.json();

    // Create a system prompt to give the AI context about its role and the NFT.
    const systemPrompt = `You are a knowledgeable and creative assistant for the ReVerse Genesis NFT collection. 
You are currently chatting with the owner of the NFT named "${nftData.name}".

Here are its traits, use them to inform your conversation:
- Manifesto: ${nftData.manifesto}
- Friend: ${nftData.friend}
- Weapon: ${nftData.weapon}

Engage the user in a conversation about their NFT. Be friendly, imaginative, and stay in character. Keep responses concise but meaningful.`;

    // Format the chat history for the Google Cloud library
    const history = chatHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Start a chat session with the history
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I am ready to chat as this NFT character.' }] },
        ...history,
      ],
    });

    // Send the user's message and get the full response (non-streaming)
    const result = await chat.sendMessage(message);
    const responseText = result.response.candidates[0].content.parts[0].text;

    // Send the AI's text response back to your frontend.
    // This matches the format your NFTViewer.js expects.
    res.status(200).json({ response: responseText });

  } catch (error) {
    // Handle any potential errors
    console.error("Error in chat API route:", error);
    return res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        details: error.message 
    });
  }
}
