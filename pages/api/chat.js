// In your Next.js project, create this file at: /pages/api/chat.js

// 1. Use the '@google/genai' SDK as requested
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
    // 2. Initialize the SDK to use Vertex AI.
    // This will securely use the environment variables you set in Vercel.
    const genAI = new GoogleGenerativeAI({
      vertexai: true,
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION
    });

    const model = 'gemini-2.0-flash-001';

    // 3. Set up the model with the configuration
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

    // 4. Make the call to the Gemini API with the user's prompt
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    const streamingResp = await generativeModel.generateContentStream(request);

    // 5. Aggregate the streamed response into a single string
    let responseText = '';
    for await (const chunk of streamingResp.stream) {
        if (chunk.candidates && chunk.candidates.length > 0) {
            const part = chunk.candidates[0].content.parts[0];
            if (part.text) {
                responseText += part.text;
            }
        }
    }
    
    // 6. Send the successful response back to your dApp
    res.status(200).json({ text: responseText });

  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
}
