"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ChatItem {
  id: string;
  title: string;
}

export default function ChatSidebar() {
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedChats = localStorage.getItem("chat_list");
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        if (Array.isArray(parsedChats)) {
          setChatList(parsedChats);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar chats do localStorage:", error);
    }
  }, []);

  return (
    <aside className="w-72 h-screen bg-zinc-800 text-white p-4 border-r border-zinc-900 fixed">
      <ul className="relative top-16 space-y-2">
        {chatList.length > 0 ? (
          chatList.map((chat) =>
            chat?.id && chat?.title ? (
              <li key={chat.id}>
                <div className="relative group">
                  <Link
                    href={`/chat/${chat.id}`}
                    className={`block px-3 py-2 rounded-md transition-all ${
                      pathname === `/chat/${chat.id}`
                        ? "bg-zinc-700 text-white"
                        : "hover:bg-zinc-700 text-gray-300"
                    }`}
                  >
                    {chat.title.length > 20 ? chat.title.slice(0, 25) + "..." : chat.title}
                  </Link>

                  {/* Tooltip Melhorado */}
                  <span className="absolute left-60 -translate-x-1/2 bg-black text-white text-xs rounded-md px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                    {chat.title}
                  </span>
                </div>
              </li>
            ) : null
          )
        ) : (
          <p className="text-gray-400">Nenhum chat registrado...</p>
        )}
      </ul>
    </aside>
  );
}
