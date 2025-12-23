import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/ai/megaLlmService";
import { ChatMessage } from "../../types";

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "Xin chào! Tôi là trợ lý ngôn ngữ và văn hóa. Bạn có thể hỏi tôi về tiếng Nùng, phong tục tập quán, hoặc tiếng địa phương miền Trung. Tôi có thể giúp gì cho bạn hôm nay?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user",
        text: m.text,
      }));

      const responseText = await sendChatMessage(history, userMsg.text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: "err",
        role: "model",
        text:
          (err as any).message ||
          "Xin lỗi, tôi gặp lỗi khi xử lý. Vui lòng thử lại.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col p-4 md:p-8">
      {/* Bot Header */}
      <div className="bg-white border-4 border-black shadow-brutal p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-nung-red/5 -mr-12 -mt-12 rounded-full"></div>
        <div className="flex items-center relative z-10">
          <div className="w-16 h-16 border-4 border-black bg-nung-blue text-white flex items-center justify-center mr-4 shadow-brutal-sm rotate-3">
            <i className="fa-solid fa-robot text-3xl"></i>
          </div>
          <div>
            <h2 className="text-3xl font-display font-black text-nung-dark uppercase tracking-tighter">
              Trợ lý Ngôn ngữ
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border border-black">
                HỆ THỐNG AI
              </span>
              <span className="text-nung-red font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                <span className="w-2 h-2 bg-nung-red rounded-full animate-pulse"></span>
                ĐANG TRỰC TUYẾN
              </span>
            </div>
          </div>
        </div>
        <span className="bg-nung-sand border-2 border-black px-3 py-1 font-black uppercase tracking-widest text-[10px] -rotate-1">
          Beta Version 2.0
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-nung-sand/5 bg-paper border-4 border-black shadow-brutal p-6 space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[85%] group`}>
              {msg.role === "model" && (
                <p className="text-[10px] font-black uppercase tracking-widest text-nung-blue mb-2 pl-2">
                  ANTIGRAVITY BOT
                </p>
              )}
              {msg.role === "user" && (
                <p className="text-[10px] font-black uppercase tracking-widest text-nung-red mb-2 text-right pr-2">
                  BẠN
                </p>
              )}

              <div
                className={`px-6 py-4 border-4 border-black transform transition-all group-hover:rotate-0 ${
                  msg.role === "user"
                    ? "bg-nung-blue text-white shadow-brutal-sm -rotate-1"
                    : "bg-white text-nung-dark shadow-brutal-sm rotate-1"
                }`}
              >
                <p className="text-lg font-serif font-bold leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                <div
                  className={`mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <i className="fa-solid fa-clock"></i>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border-4 border-black px-6 py-4 shadow-brutal-sm flex items-center space-x-3 rotate-1">
              <div className="w-3 h-3 bg-nung-red border-2 border-black animate-bounce"></div>
              <div className="w-3 h-3 bg-nung-red border-2 border-black animate-bounce delay-75"></div>
              <div className="w-3 h-3 bg-nung-red border-2 border-black animate-bounce delay-150"></div>
              <span className="ml-2 font-black uppercase tracking-widest text-xs">
                AI đang soạn tin...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-6 bg-white border-4 border-black shadow-brutal p-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1 bg-nung-red/10"></div>
        <div className="flex items-center gap-4 relative z-10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Gửi tin nhắn cho trợ lý ảo..."
            className="flex-1 bg-nung-sand/10 border-2 border-black px-6 py-4 focus:outline-none focus:bg-white focus:ring-4 focus:ring-nung-blue/20 transition-all font-serif font-bold text-nung-dark placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-nung-red text-white border-4 border-black p-4 flex items-center justify-center shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            <i className="fa-solid fa-paper-plane text-2xl group-hover:rotate-12 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
