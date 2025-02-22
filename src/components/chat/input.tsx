import { SendHorizonal } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ChatInput({ onMessageSend }: { onMessageSend: (message: string) => void }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onMessageSend(input); // Envia a mensagem
      setInput(""); // Limpa o campo de entrada
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
    <div className="w-full max-w-[800px] p-4">
      <form onSubmit={handleSubmit} className="flex items-center w-full">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-zinc-800 flex-1 p-3 py-3.5 pr-12 rounded-[3px] outline-none text-white max-h-[200px] overflow-hidden resize-none scrollbar-custom"
          placeholder="Digite uma pergunta ou linha de comando..."
          rows={1}
        />
        <button type="submit" className="ml-2 text-white focus:outline-none transition">
          <SendHorizonal className="w-10 h-6" />
        </button>
      </form>
    </div>
  );
}
