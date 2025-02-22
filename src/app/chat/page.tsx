"use client";

import { ChatMessages } from "@/@types";

import ChatInput from "@/components/chat/input";
import ChatLayout from "@/components/chat/layout";
import ChatSidebar from "@/components/layout/sidebar";

import { useChat } from "@/providers/chatProvider";
import { generateChatTitle } from "@/services/generateTitle";

import { List, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const router = useRouter();
  const { addMessages, messages } = useChat();

  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const potentialId = pathParts[pathParts.length - 1];

    if (potentialId && potentialId !== "chat") {
      setChatId(potentialId);
    }
  }, []);

  const handleMessageSend = async (message: string) => {
    let currentChatId = chatId;

    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
      router.replace(`/chat/${currentChatId}`);
    }

    const newMessage: ChatMessages = {
      role: "user",
      parts: [message],
    };

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
      const clientMessage: ChatMessages = {
        role: "model",
        parts: [data.text + "\n"],
      };

      addMessages(clientMessage);

      const storedMessages = JSON.parse(
        localStorage.getItem(`chat_message/${currentChatId}`) || "[]"
      );
      const updatedMessages = [...storedMessages, newMessage, clientMessage];

      localStorage.setItem(`chat_message/${currentChatId}`, JSON.stringify(updatedMessages));

      let chatList: { id: string; title: string }[] = [];

      try {
        const storedChats = localStorage.getItem("chat_list");
        if (storedChats) {
          chatList = JSON.parse(storedChats);
          if (!Array.isArray(chatList)) chatList = [];
        }
      } catch (error) {
        console.error("Erro ao carregar lista de chats:", error);
        chatList = [];
      }

      if (!chatList.some((chat) => chat?.id === currentChatId)) {
        const chatTitle = await generateChatTitle(updatedMessages);
        chatList.push({ id: currentChatId, title: chatTitle });

        localStorage.setItem("chat_list", JSON.stringify(chatList));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen overflow-hidden">
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
        <div className="flex flex-col w-full max-w-[900px] flex-1 overflow-y-auto">
          <ChatLayout messages={messages} isLoading={isLoading} onSendMessage={handleMessageSend} />
        </div>
        <ChatInput onMessageSend={handleMessageSend} />
        <p className="text-xs text-white/75">
          A Kyoto pode cometer erros. Considere verificar informações importantes.
        </p>
      </section>
    </main>
  );
}
