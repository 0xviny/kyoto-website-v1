import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreVertical, Trash, Pencil, Bookmark } from "lucide-react";
import Modal from "./modals";
import Notification from "./notifications";

interface ChatItem {
  id: string;
  title: string;
}

export default function ChatSidebar() {
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState<string>("");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const deleteChat = (id: string) => {
    const updatedChats = chatList.filter((chat) => chat.id !== id);
    setChatList(updatedChats);
    localStorage.setItem("chat_list", JSON.stringify(updatedChats));
    setDeleteModalOpen(false);
    setDropdownOpen(null);
  };

  const confirmDeleteChat = (id: string) => {
    setSelectedChatId(id);
    setDeleteModalOpen(true);
    setDropdownOpen(null);
  };

  const renameChat = () => {
    if (newChatTitle.trim() === "") return;
    const updatedChats = chatList.map((chat) =>
      chat.id === selectedChatId ? { ...chat, title: newChatTitle } : chat
    );
    setChatList(updatedChats);
    localStorage.setItem("chat_list", JSON.stringify(updatedChats));
    setRenameModalOpen(false);
    setNewChatTitle("");
    setDropdownOpen(null);
  };

  const saveChatLink = (id: string) => {
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url);
    setNotificationMessage("Link copiado para a área de transferência!");
    setNotificationVisible(true);
    setDropdownOpen(null);
  };

  return (
    <aside className="w-full md:w-72 h-screen bg-zinc-800 text-white p-4 border-r border-zinc-900 fixed">
      <ul className="relative top-16 space-y-2">
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <li key={chat.id} className="relative group flex items-center justify-between">
              <Link
                href={`/chat/${chat.id}`}
                className={`block px-3 py-2 flex-1 rounded-md transition-all ${
                  pathname === `/chat/${chat.id}`
                    ? "bg-zinc-700 text-white"
                    : "hover:bg-zinc-700 text-gray-300"
                }`}
              >
                {chat.title.length > 20 ? chat.title.slice(0, 25) + "..." : chat.title}
              </Link>

              <button
                onClick={() => setDropdownOpen(dropdownOpen === chat.id ? null : chat.id)}
                className="p-1"
              >
                <MoreVertical size={18} />
              </button>

              {dropdownOpen === chat.id && (
                <div
                  ref={dropdownRef}
                  className="absolute right-3 top-7 w-40 bg-zinc-900 border border-zinc-700 shadow-md rounded-md z-20"
                >
                  <button
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setNewChatTitle(chat.title);
                      setRenameModalOpen(true);
                      setDropdownOpen(null);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700"
                  >
                    <Pencil size={16} /> Renomear
                  </button>
                  <button
                    onClick={() => saveChatLink(chat.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-700"
                  >
                    <Bookmark size={16} /> Salvar Link
                  </button>
                  <button
                    onClick={() => confirmDeleteChat(chat.id)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-700 hover:text-white"
                  >
                    <Trash size={16} /> Apagar
                  </button>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-gray-400">Nenhum chat registrado...</p>
        )}
      </ul>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteChat(selectedChatId!)}
        title="Confirmar Exclusão"
        message="Você tem certeza que deseja excluir este chat?"
      />
      <Modal
        isOpen={isRenameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        onConfirm={renameChat}
        title="Renomear Chat"
        inputValue={newChatTitle}
        onInputChange={setNewChatTitle}
      />

      <Notification
        isVisible={notificationVisible}
        message={notificationMessage}
        onClose={() => setNotificationVisible(false)}
      />
    </aside>
  );
}
