// server.js
import express from 'express';
import { VertexAI } from '@google-cloud/aiplatform';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors()); // Allow requests from your dApp
app.use(express.json());

// Initialize Vertex AI
const vertex_ai = new VertexAI({ project: process.env.PROJECT_ID, location: process.env.LOCATION_ID });
const model = process.env.MODEL_ID;

const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    "temperature": 1,
    "maxOutputTokens": 512,
    "topP": 1,
  },
  safetySettings: [ // Safety settings from your request
    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }
  ],
});

// Define the /api/chat endpoint
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };
    const streamingResp = await generativeModel.generateContentStream(request);
    const aggregatedResponse = await streamingResp.response;
    const responseText = aggregatedResponse.candidates[0].content.parts[0].text;
    
    res.json({ text: responseText });
  } catch (error) {
    console.error('Error calling Vertex AI:', error);
    res.status(500).json({ error: 'Failed to get response from AI.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Secure AI proxy server running on http://localhost:${PORT}`);
});