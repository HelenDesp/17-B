import { vertex } from "@ai-sdk/google-vertex"
import { generateText } from "ai"
import { GoogleAuth } from "google-auth-library"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { message, nftData, chatHistory } = req.body

    if (!message || !nftData) {
      return res.status(400).json({ error: "Message and NFT data are required" })
    }

    // Parse credentials directly from environment variable
    let credentials
    try {
      credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    } catch (parseError) {
      console.error("Failed to parse credentials:", parseError)
      return res.status(500).json({
        error: "Invalid credentials format",
        details: "GOOGLE_APPLICATION_CREDENTIALS must be valid JSON",
      })
    }

    // Create Google Auth client directly
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })

    // Get access token
    const authClient = await auth.getClient()
    const accessToken = await authClient.getAccessToken()

    console.log("Authentication successful, got access token")

    // Build conversation history for context
    let conversationContext = ""
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory
        .slice(-10)
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

    // Initialize the Vertex AI model with the access token
    const model = vertex("gemini-2.0-flash", {
      project: process.env.GOOGLE_CLOUD_PROJECT_ID,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
      // Use the access token directly
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
      },
    })

    console.log("Attempting to generate text with direct auth...")

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
    console.error("=== DETAILED ERROR INFORMATION ===")
    console.error("Error message:", error.message)
    console.error("Error name:", error.name)
    console.error("Error stack:", error.stack)

    // Check if it's an authentication error
    if (error.message.includes("authentication") || error.message.includes("credentials")) {
      return res.status(401).json({
        error: "Authentication failed",
        details: error.message,
        suggestion: "Check your Google Cloud credentials and permissions",
      })
    }

    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
      errorType: error.name,
      timestamp: new Date().toISOString(),
    })
  }
}
