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

    // Log environment variables for debugging (remove in production)
    console.log("Environment check:", {
      hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      hasLocation: !!process.env.GOOGLE_CLOUD_LOCATION,
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION,
    })

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

    // Parse credentials from environment variable
    let credentials
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    } catch (error) {
      console.error("Failed to parse Google credentials:", error)
      return res.status(500).json({ 
        error: "Invalid Google credentials configuration",
        details: "Credentials must be valid JSON"
      })
    }

    // Initialize the Vertex AI model with parsed credentials
    const model = vertex("gemini-1.5-flash", {
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
      googleAuthOptions: {
        credentials: credentials,
      },
    })

    console.log("Attempting to generate text...")

    // Generate response using AI SDK
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    })

    console.log("Text generated successfully")

    res.status(200).json({ response: text })
  } catch (error) {
    // Enhanced error logging
    console.error("=== DETAILED ERROR INFORMATION ===")
    console.error("Error message:", error.message)
    console.error("Error name:", error.name)
    console.error("Error stack:", error.stack)
    console.error("Error cause:", error.cause)

    // Log environment variables (safely)
    console.error("Environment check:", {
      hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      projectIdLength: process.env.GOOGLE_CLOUD_PROJECT_ID?.length,
      hasLocation: !!process.env.GOOGLE_CLOUD_LOCATION,
      location: process.env.GOOGLE_CLOUD_LOCATION,
      hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      credentialsType: typeof process.env.GOOGLE_APPLICATION_CREDENTIALS,
      credentialsLength: process.env.GOOGLE_APPLICATION_CREDENTIALS?.length,
    })

    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
      errorType: error.name,
      debug: {
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasLocation: !!process.env.GOOGLE_CLOUD_LOCATION,
        hasCredentials: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
        timestamp: new Date().toISOString(),
      },
    })
  }
}