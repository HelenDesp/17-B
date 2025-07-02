import { vertex } from "@ai-sdk/google-vertex"
import { generateText } from "ai"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { message, nftData, chatHistory } = req.body

    if (!message || !nftData) {
      return res.status(400).json({ error: "Message and NFT data are required" })
    }

    // Build conversation history for context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory
        .slice(-10) // Keep last 10 messages for context
        .map((msg) => `${msg.role === "user" ? "Human" : "NFT"}: ${msg.content}`)
        .join("\n")
    }

    // Create the prompt
    const prompt = `You are an AI assistant embodying a ReVerse Genesis NFT character. Here are your character details:

Character Information:
- Name: ${nftData.name}
- Token ID: ${nftData.tokenId}
- Manifesto: ${nftData.manifesto}
- Friend: ${nftData.friend}
- Weapon: ${nftData.weapon}

Instructions:
1. Respond as this specific NFT character, incorporating the traits and characteristics mentioned above
2. Be creative, engaging, and stay in character
3. Reference your manifesto, friend, and weapon when relevant to the conversation
4. Keep responses conversational and interesting
5. Show personality based on your traits

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ""}

Current message from human: ${message}

Respond as ${nftData.name}:`

    // Initialize the Vertex AI model
    const model = vertex("gemini-1.5-flash", {
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    })

    // Generate response using AI SDK
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    })

    res.status(200).json({ response: text })
  } catch (error) {
    console.error("Error with Vertex AI:", error)
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    })
  }
}
