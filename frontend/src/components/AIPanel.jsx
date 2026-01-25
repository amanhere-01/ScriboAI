import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function AIPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm your AI writing assistant. I can help you brainstorm ideas, refine your writing, answer questions, or continue your document. What would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  //Lock background scroll when panel is open
  useEffect(() => {
    if (isOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "";
    }

    return () => {
        document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSend = async () => {
    if (isTyping || !input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try{
      const res = await fetch(`${BACKEND_URL}/ai/chat`,{
        method: "POST",
        headers:{
          "Content-Type":"application/json"
        },
        credentials:"include",
        body : JSON.stringify({
          message : userMessage.content 
        })
      })

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "AI request failed");
      }

      const aiMessgae = { role:"assistant", content:data.reply};
      setMessages((prev) => [...prev, aiMessgae]);

    } catch(err){

      console.error(err);
      setMessages((prev) => [...prev, 
        {
          role: "assistant",
          content: "⚠️ Sorry, I couldn't get a response right now. Please try again."
        }
      ]);

    } finally{
      setIsTyping(false);
    }
    
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop without blur effect */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-white to-gray-50 z-40 shadow-2xl
                    transform transition-all duration-300 ease-out
                    ${isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
                    flex flex-col`}
      >
        {/* Header with gradient */}
        <div className="relative h-20 px-6 flex items-center justify-between border-b border-gray-200/50 shrink-0 bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">AI Assistant</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
          </button>
          
          {/* Decorative gradient orb */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        </div>

        {/* Quick Actions */}
        {/* <div className="px-6 py-4 border-b border-gray-200/50 shrink-0 bg-white/50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["Summarize", "Improve writing", "Expand ideas", "Fix grammar"].map((action) => (
              <button
                key={action}
                className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-medium text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 whitespace-nowrap shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>
        </div> */}

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-black to-gray-400">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-yellow-500 to-purple-600"
                    : "bg-gradient-to-br from-orange-500 to-cyan-600"
                }`}
              >
                {msg.role === "user" ? (<User className="w-4 h-4 text-black" />) : ( <Bot className="w-4 h-4 text-black" />)}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-md"
                }`}
              >
                <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-400/50 bg-gray-200 shrink-0 shadow-lg">
          <div className="flex gap-2 items-stretch">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything or describe what you need..."
                rows={1}
                className="w-full border-2 border-gray-400 rounded-2xl px-4 py-3 pr-12 outline-none focus:border-gray-600 focus:ring-4 focus:ring-gray-200 transition-all duration-200 resize-none text-sm"
                style={{ maxHeight: "120px" }}
              />
              <div className="absolute right-3 bottom-3 text-xs text-gray-400">
                {input.length > 0 && `${input.length} chars`}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center group shrink-0"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p>
        </div>
      </div>
    </>
  );
}