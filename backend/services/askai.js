import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";


// GEMINI Services
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(prompt) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Query must be a non-empty string");
  }

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: "You are a helpful AI assistant. Answer clearly and concisely.",
    },
  });

  return response.text;
}

// GROQ Services
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askGroq(prompt){
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Query must be a non-empty string");
  }

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0].message.content;
}
