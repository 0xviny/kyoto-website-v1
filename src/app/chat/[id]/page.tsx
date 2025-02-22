"use client";

import { useParams } from "next/navigation";

import ChatLayout from "@/components/chat/layout";
import ChatInput from "@/components/chat/input";
import ChatSidebar from "@/components/layout/sidebar";

import { ChatMessages } from "@/@types";
import { useChat } from "@/providers/chatProvider";

import { useEffect, useState } from "react";
import { List, X } from "lucide-react";

export default function ChatPageId() {
  const { id } = useParams();
  const { messages, addMessages, setMessages } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (id) {
      const storedMessages = localStorage.getItem(`chat_message/${id}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages) as ChatMessages[]);
      }
    }
  }, [id, setMessages]);

  const handleMessageSend = async (message: string) => {
    const newMessage: ChatMessages = { role: "user", parts: [message] };
    addMessages(newMessage);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/kyoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: message, history: [...messages, newMessage] }),
      });

      const data = await response.json();
      const botMessage: ChatMessages = {
        role: "model",
        parts: [data.text + "\n"],
      };
      addMessages(botMessage);

      localStorage.setItem(
        `chat_message/${id}`,
        JSON.stringify([...messages, newMessage, botMessage])
      );
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main className="flex h-screen">
        {isSidebarOpen && <ChatSidebar />}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 text-white p-2 rounded"
        >
          {!isSidebarOpen ? <List /> : <X />}
        </button>
        <section
          className={`flex-1 flex flex-col items-center text-white p-4 transition-all ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="flex flex-col w-full max-w-[800px] flex-1 overflow-y-auto">
            <ChatLayout
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleMessageSend}
            />
          </div>
          <ChatInput onMessageSend={handleMessageSend} />
          <p className="text-sm text-white/75">
            A Kyoto pode cometer erros. Considere verificar informações importantes.
          </p>
        </section>
      </main>
    </>
  );
}
