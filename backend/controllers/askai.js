const { askGemini } = require("../configs/gemini");

async function handleAskAIChat(req, res){

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const aiReply = await askGemini(message);

    return res.status(200).json({
      reply: aiReply,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return res.status(500).json({
      error: "AI service temporarily unavailable",
    });
  }

}

module.exports = {handleAskAIChat}