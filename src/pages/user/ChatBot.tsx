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

  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

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
      // Format history for the new service structure (simple array of role/text)
      const history = messages.map((m) => ({
        role: m.role === "model" ? "assistant" : "user", // OpenAI uses 'assistant' usually, but let's stick to what the service expects
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
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col p-4">
      <div className="bg-white rounded-t-xl shadow-lg border-b border-earth-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-bamboo-100 flex items-center justify-center mr-3">
            <i className="fa-solid fa-robot text-bamboo-600"></i>
          </div>
          <div>
            <h2 className="font-bold text-earth-900">Trợ lý Ngôn ngữ</h2>
            <p className="text-xs text-earth-500">Hỗ trợ bởi AI</p>
          </div>
        </div>
        <p className="text-sm text-earth-500 mb-4 text-green-700">
          (Tính năng đang được phát triển)
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-earth-50 p-4 space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.role === "user"
                  ? "bg-bamboo-600 text-white rounded-br-none"
                  : "bg-white text-earth-800 border border-earth-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.role === "user" ? "text-bamboo-200" : "text-earth-400"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none px-5 py-3 border border-earth-100 shadow-sm flex items-center space-x-2">
              <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-earth-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 rounded-b-xl shadow-lg border-t border-earth-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Hỏi về từ vựng Nùng, ngữ pháp hoặc văn hóa..."
            className="flex-1 border border-earth-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-bamboo-500 focus:border-transparent text-earth-800 placeholder-earth-400"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-bamboo-600 hover:bg-bamboo-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
