import { Globe, SendHorizonal } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ChatInput({
  onMessageSend,
  onWebSearch,
}: {
  onMessageSend: (message: string) => void;
  onWebSearch?: (query: string) => void;
}) {
  const [input, setInput] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      if (isSearchMode) {
        onWebSearch!(input); // Faz a busca na web
      } else {
        onMessageSend(input); // Envia para o bot responder
      }
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-[800px] p-4 bg-zinc-800 rounded-lg">
      {/* Input */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-white placeholder-white/50 border-none outline-none resize-none p-3 text-base"
        placeholder="Pergunte algo ou pesquise na web"
        rows={1}
      />

      {/* Barra de botões */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex gap-2">
          {/* Botão de Buscar */}
          <button
            type="button"
            onClick={() => setIsSearchMode((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition
              ${
                isSearchMode
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-white/70 hover:text-white"
              }
            `}
          >
            <Globe className="w-4 h-4" />
            Buscar
          </button>
        </div>

        {/* Botão de envio */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
