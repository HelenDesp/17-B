// In your Next.js project, create this file at: /pages/api/chat.js

// Using the official Google Cloud AI Platform library for better stability on Vercel
import { VertexAI } from '@google-cloud/aiplatform';

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
    // This is a more robust way to initialize for Vercel.
    // It will automatically use the environment variables.
    const vertex_ai = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION,
    });

    const model = 'gemini-2.0-flash-001';

    const generativeModel = vertex_ai.preview.getGenerativeModel({
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

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    
    // Using the non-streaming method for simplicity and stability
    const response = await generativeModel.generateContent(request);
    
    const aggregatedResponse = await response.response;
    const responseText = aggregatedResponse.candidates[0].content.parts[0].text;

    res.status(200).json({ text: responseText });

  } catch (error) {
    // This will provide detailed error logs in your Vercel dashboard
    console.error('ERROR IN /api/chat:', error.message);
    console.error('Full Error Details:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Failed to get response from AI.', 
      details: error.message 
    });
  }
}
