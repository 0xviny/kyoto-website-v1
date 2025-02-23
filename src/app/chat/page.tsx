"use client";

import { ChatMessages } from "@/@types";

import ChatInput from "@/components/chat/input";
import ChatLayout from "@/components/chat/layout";
import ChatSidebar from "@/components/layout/sidebar";

import { useChat } from "@/providers/chatProvider";
import { generateChatTitle } from "@/services/generateTitle";

import { List, Search, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface ChatItem {
  id: string;
  title: string;
  timestamp: number;
}

export default function ChatPage() {
  const router = useRouter();
  const { addMessages, messages } = useChat();

  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const potentialId = pathParts[pathParts.length - 1];

    if (potentialId && potentialId !== "chat") {
      setChatId(potentialId);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSearchPopup = () => {
    setIsOpen(!isOpen);
    setIsSidebarOpen(false)
  };

  const categorizeChats = (chats: ChatItem[]) => {
    const now = Date.now();

    return chats.reduce<Record<string, ChatItem[]>>((acc, chat) => {
      const diff = now - chat.timestamp;

      let category = "Mais Antigos";

      if (diff < 24 * 60 * 60 * 1000) {
        category = "Hoje";
      } else if (diff < 48 * 60 * 60 * 1000) {
        category = "Ontem";
      } else if (diff < 7 * 24 * 60 * 60 * 1000) {
        category = "Últimos 7 Dias";
      } else if (diff < 30 * 24 * 60 * 60 * 1000) {
        category = "Últimos 30 Dias";
      }

      if (!acc[category]) acc[category] = [];
      acc[category].push(chat);

      return acc;
    }, {});
  };

  const [allChats, setAllChats] = useState<ChatItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const chats = JSON.parse(localStorage.getItem("chat_list") || "[]");
      setAllChats(chats);
    }
  }, []);

  const filteredChats = allChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFilteredChats = categorizeChats(filteredChats);

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

      let chatList: { id: string; title: string; timestamp: number }[] = [];

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
        chatList.push({ id: currentChatId, title: chatTitle, timestamp: Date.now() });

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
      <div
        className={`fixed top-4 left-4 z-50 flex items-center ${
          isSidebarOpen ? "w-full md:w-64 justify-between" : "space-x-2"
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white p-2 rounded-lg hover:bg-zinc-700 transition"
        >
          {!isSidebarOpen ? <List /> : <X />}
        </button>

        <div className="mr-5 md:mr-0">
          {isSidebarOpen && (
            <button
              onClick={toggleSearchPopup}
              className="text-white p-2 rounded-lg hover:bg-zinc-700 transition"
            >
              <Search />
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="text-white p-2 rounded-lg hover:bg-zinc-700 transition"
          >
            <SquarePen />
          </button>
        </div>
      </div>
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

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-zinc-900 p-4 rounded-lg shadow-lg w-[500px] space-y-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar em chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 rounded-md bg-zinc-800 text-white placeholder-gray-400 pr-8"
              />
              <button
                onClick={toggleSearchPopup}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <ul className="max-h-60 overflow-y-auto space-y-2">
              <li className="p-2 hover:bg-zinc-800 rounded-md">
                <button
                  onClick={() => router.push("/chat")}
                  className="flex items-center gap-2 text-white"
                >
                  <SquarePen size={18} /> Criar novo chat
                </button>
              </li>

              {Object.entries(groupedFilteredChats)
                .slice()
                .reverse()
                .map(([category, chatList]) => (
                  <div key={category}>
                    <h3 className="text-gray-400 text-sm mb-2">{category}</h3>
                    {chatList.length > 0 ? (
                      chatList.map((chat) => (
                        <li
                          key={chat.id}
                          className="relative group flex items-center justify-between"
                        >
                          <Link
                            href={`/chat/${chat.id}`}
                            className={`block px-3 py-2 flex-1 rounded-md transition-all ${
                              pathname === `/chat/${chat.id}`
                                ? "bg-zinc-700 text-white"
                                : "hover:bg-zinc-700 text-gray-300"
                            }`}
                          >
                            {chat.title.length > 20 ? chat.title.slice(0, 100) + "..." : chat.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-400">Nenhum chat encontrado...</p>
                    )}
                  </div>
                ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
