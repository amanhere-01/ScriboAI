const { askGemini, askGroq } = require("../services/askai");

async function handleAskAIChat(req, res){
  
  try {
    const { message, provider } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    let aiReply;
    if(provider === "gemini"){
      aiReply = await askGemini(message);
    }
    else{
      aiReply = await askGroq(message);
    }

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