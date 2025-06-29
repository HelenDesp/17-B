// pages/api/chat.js
// This is your new, simplified backend that runs directly on Vercel.

import { GoogleGenerativeAI } from '@google/generative-ai';

// --- CONFIGURATION ---
// This uses the API key you already have.
// IMPORTANT: In a real production app, move this to a .env.local file for security.
const GEMINI_API_KEY = 'AIzaSyBLGKuo9GI-tYCaf3PsJHyiNZg78BziPpU';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: 'Invalid chatHistory provided.' });
    }

    // Convert the history to the format the SDK expects
    const historyForAPI = chatHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: msg.parts || [{ text: msg.text }],
    }));

    // The last message is the new prompt. We remove the system prompt for the chat session.
    const latestUserMessage = historyForAPI.pop();
    const systemPrompt = historyForAPI.shift(); // The first message is the system prompt

    const chat = model.startChat({
        history: historyForAPI, // Start chat with the actual conversation history
        // The system instruction is handled differently in this SDK
        systemInstruction: systemPrompt.parts[0].text,
    });
    
    const result = await chat.sendMessage(latestUserMessage.parts[0].text);
    const response = result.response;
    const aiResponseText = response.text();

    // Send the successful response back to the frontend
    return res.status(200).json({ text: aiResponseText });

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Failed to get response from AI.', details: error.message });
  }
}
