// In your Next.js project, create this file at: /pages/api/chat.js

import { GoogleGenerativeAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const genAI = new GoogleGenerativeAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION
    });

    const model = 'gemini-2.0-flash-001';

    const generativeModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        "temperature": 1,
        "maxOutputTokens": 512,
        "topP": 1,
      },
      safetySettings: [
        { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }
      ],
    });

    // --- CHANGE: Using the simpler, more robust generateContent method ---
    // This waits for the full response from the AI instead of streaming it.
    // This will fix the 500 Internal Server Error.
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    res.status(200).json({ text: responseText });

  } catch (error) {
    // This will now provide more detailed logs in your Vercel dashboard
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to get response from AI.', details: error.message });
  }
}
