"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ChatMessage, sendChatMessage } from "@/lib/api";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi! I'm your ShelfMind AI Assistant. I have live access to your inventory, sales, and forecast data. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Optimistic UI
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: userMessage }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(userMessage, messages.slice(1)); // exclude the intro
      setMessages([...updatedMessages, { role: "model", text: reply }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to communicate with AI");
      // Remove user message if failed? Or keep it. Let's keep it but show an error.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Bot className="h-6 w-6 text-violet-400" /> AI Assistant
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Ask questions about your inventory, forecasts, and sales trends.
        </p>
      </div>

      {/* Chat Box Container */}
      <div className="flex-1 bg-[#111118] border border-white/10 rounded-2xl flex flex-col overflow-hidden relative">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' 
                    ? 'bg-violet-600' 
                    : 'bg-indigo-500/10 border border-indigo-500/20'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-indigo-400" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}

          <div ref={endOfMessagesRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/10">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about restocks, slow movers, or overall metrics..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white h-10 w-10"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-3">
            <p className="text-[10px] text-zinc-600">
              AI can make mistakes. Verify critical inventory numbers independently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
