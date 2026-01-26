import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Bot, User, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


export default function AIPanel({ onClose, onInsert }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! 👋 I'm your AI writing assistant. I can help you brainstorm ideas, refine your writing, answer questions, or continue your document. What would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


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
          message : userMessage.content,
          provider : provider
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

      {/* Side Panel */}
      <div className="h-full w-full bg-gradient-to-br from-white to-gray-50 shadow-2xl flex flex-col">

        {/* Header with gradient */}
        <div className="relative h-20 px-6 flex items-center justify-between border-b border-gray-200/50 shrink-0 bg-gradient-to-r from-slate-600 to-cyan-800 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">Ask AI</h2>
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


        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-b from-black to-gray-400">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
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

                {msg.role === "assistant" && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => onInsert?.(msg.content)}
                      className="text-xs px-3 py-1 rounded-full
                                bg-purple-100 text-purple-700
                                hover:bg-purple-200 transition"
                    >
                      ➕ Insert into doc
                    </button>
                  </div>
                )}
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
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 text-white hover:shadow-lg hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center group shrink-0"
            >
              <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          {/* <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift + Enter for new line
          </p> */}

          {/* Model Selector */}


          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800 font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full" />
                AI Model
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isTyping}
                  onClick={() => setProvider("gemini")}
                  className={`group relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${provider === "gemini"
                      ? "bg-black text-white shadow-lg shadow-purple-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                    ${isTyping ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isTyping}
                  onClick={() => setProvider("groq")}
                  className={`group relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                    ${provider === "groq"
                      ? "bg-black text-white shadow-lg shadow-purple-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                    ${isTyping ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Groq</span>
                  </div>
                </button>
              </div>
            </div>
          </div>








        </div>
      </div>
    </>
  );
}