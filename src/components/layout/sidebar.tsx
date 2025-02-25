import { useEffect, useState, useRef } from "react";  
import Link from "next/link";  
import { usePathname, useRouter } from "next/navigation";  
import { MoreVertical, Trash, Pencil, Bookmark, Trash2, Sparkles } from "lucide-react";  
import Modal from "./modals";  
import Notification from "./notifications";  
  
interface ChatItem {  
  id: string;  
  title: string;  
  timestamp: number;  
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
  const [deleteAll, setDeleteAll] = useState(false); // Estado para saber se é exclusão total  
  
  const pathname = usePathname();  
  const route = useRouter();  
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
  
  const categorizeChats = (chats: ChatItem[]) => {  
    const now = Date.now();  
    return chats.reduce<Record<string, ChatItem[]>>((acc, chat) => {  
      const diff = now - chat.timestamp;  
      let category = "Mais Antigos";  
  
      if (diff < 24 * 60 * 60 * 1000) category = "Hoje";  
      else if (diff < 48 * 60 * 60 * 1000) category = "Ontem";  
      else if (diff < 7 * 24 * 60 * 60 * 1000) category = "Últimos 7 Dias";  
      else if (diff < 30 * 24 * 60 * 60 * 1000) category = "Últimos 30 Dias";  
  
      if (!acc[category]) acc[category] = [];  
      acc[category].push(chat);  
      return acc;  
    }, {});  
  };  
  
  const deleteAllChats = () => {  
    localStorage.clear();  
    setChatList([]);  
  };  
  
  const deleteChat = (id: string) => {  
    const updatedChats = chatList.filter((chat) => chat.id !== id);  
    setChatList(updatedChats);  
    localStorage.setItem("chat_list", JSON.stringify(updatedChats));  
  };  

  const confirmDeleteAllChats = () => {  
    setDeleteAll(true);  
    setDeleteModalOpen(true);  
    setDropdownOpen(null);  
  };  

  const confirmDeleteChat = (id: string) => {  
    setSelectedChatId(id);  
    setDeleteAll(false);  
    setDeleteModalOpen(true);  
    setDropdownOpen(null);  
  };  

  const handleConfirmDelete = () => {  
    if (deleteAll) {  
      deleteAllChats();  
    } else if (selectedChatId) {  
      deleteChat(selectedChatId);  
    }  
    setDeleteModalOpen(false);  
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
  
  const groupedChats = categorizeChats(chatList);  
  
  return (  
    <aside className="w-full md:w-72 h-screen bg-zinc-800 text-white p-4 border-r border-zinc-900 fixed z-50">  
      <ul className="relative top-16 space-y-4">  
        {chatList.length > 0 ? (  
          Object.entries(groupedChats)  
            .slice()  
            .reverse()  
            .map(([category, chatList]) => (  
              <div key={category}>  
                <h3 className="text-gray-400 text-sm mb-2">{category}</h3>  
                {chatList.reverse().map((chat) => (  
                  <li key={chat.id} className="relative group flex items-center justify-between">  
                    <Link  
                      href={`/chat/${chat.id}`}  
                      className={`block px-3 py-2 flex-1 rounded-md transition-all ${  
                        pathname === `/chat/${chat.id}`  
                          ? "bg-zinc-700 text-white"  
                          : "hover:bg-zinc-700 text-gray-300"  
                      }`}  
                    >  
                      {chat.title.length > 20  
                        ? chat.title.slice(0, 25).replaceAll("**", "") + "..."  
                        : chat.title.replaceAll("**", "")}  
                    </Link>  
  
                    <button  
                      onClick={() => setDropdownOpen(dropdownOpen === chat.id ? null : chat.id)}  
                      className="p-1"  
                    >  
                      <MoreVertical size={18} />  
                    </button>  
                  </li>  
                ))}  
              </div>  
            ))  
        ) : (  
          <p className="text-gray-400">Nenhum chat encontrado...</p>  
        )}  
      </ul>  
  
      <button  
        onClick={confirmDeleteAllChats}  
        className="absolute bottom-4 right-4 p-2 text-red-600 rounded-lg hover:bg-zinc-700 transition"  
      >  
        <Trash2 />  
      </button>  

      <button  
        onClick={() => route.push("/download")}  
        className="absolute flex items-center justify-center bottom-4 left-4 p-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-700 transition"  
      >  
        <Sparkles className="inline-block mr-2 text-yellow-400" /> Baixe nosso aplicativo!  
      </button>  
  
      <Modal  
        isOpen={isDeleteModalOpen}  
        onClose={() => setDeleteModalOpen(false)}  
        onConfirm={handleConfirmDelete}  
        title="Confirmar Exclusão"  
        message={deleteAll ? "Tem certeza que deseja excluir todos os chats?" : "Tem certeza que deseja excluir este chat?"}  
      />  

      <Notification  
        isVisible={notificationVisible}  
        message={notificationMessage}  
        onClose={() => setNotificationVisible(false)}  
      />  
    </aside>  
  );  
}