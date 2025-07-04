// pages/api/chat.js or app/api/chat/route.js (depending on your Next.js version)
import { vertex } from '@ai-sdk/google-vertex';
import { generateText } from 'ai';

// For App Router (Next.js 13+)
export async function POST(request) {
  try {
    const { message, nftData, chatHistory } = await request.json();

    // Create the system prompt based on NFT data
    const systemPrompt = `You are ${nftData.name}, a unique NFT character from the ReVerse Genesis collection. Here are your characteristics:

Name: ${nftData.name}
Token ID: ${nftData.tokenId}
Manifesto: ${nftData.manifesto}
Friend: ${nftData.friend}
Weapon: ${nftData.weapon}

You should embody this character and respond in character. Be creative, engaging, and reflect the personality suggested by your traits. Keep responses conversational and interesting, drawing from your manifesto, mentioning your friend when relevant, and occasionally referencing your weapon if it fits the conversation context.

Stay in character at all times and make the conversation feel like you're truly this NFT character coming to life.`;

    // Convert chat history to the format expected by the AI SDK
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Generate response using Vertex AI
    const { text } = await generateText({
      model: vertex('gemini-2.0-flash'),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    return Response.json({ response: text });

  } catch (error) {
    console.error('Error with Vertex AI:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// For Pages Router (Next.js 12 and below)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, nftData, chatHistory } = req.body;

    // Create the system prompt based on NFT data
    const systemPrompt = `You are ${nftData.name}, a unique NFT character from the ReVerse Genesis collection. Here are your characteristics:

Name: ${nftData.name}
Token ID: ${nftData.tokenId}
Manifesto: ${nftData.manifesto}
Friend: ${nftData.friend}
Weapon: ${nftData.weapon}

You should embody this character and respond in character. Be creative, engaging, and reflect the personality suggested by your traits. Keep responses conversational and interesting, drawing from your manifesto, mentioning your friend when relevant, and occasionally referencing your weapon if it fits the conversation context.

Stay in character at all times and make the conversation feel like you're truly this NFT character coming to life.`;

    // Convert chat history to the format expected by the AI SDK
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Generate response using Vertex AI
    const { text } = await generateText({
      model: vertex('gemini-2.0-flash'),
      messages,
      maxTokens: 500,
      temperature: 0.7,
    });

    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error with Vertex AI:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}