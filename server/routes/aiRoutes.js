import express from "express";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "messages array is required." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        messages: [
          { role: "system", content: system },
          ...messages.map(({ role, content }) => ({ role, content })),
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return res.status(response.status).json({ message: data?.error?.message || "Groq API error." });
    }

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Unexpected Groq response shape:", JSON.stringify(data));
      return res.status(500).json({ message: "Unexpected response from Groq." });
    }

    res.json({ content: [{ type: "text", text }] });
  } catch (err) {
    console.error("aiRoutes error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;