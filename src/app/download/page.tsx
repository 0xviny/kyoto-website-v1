"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
  }>;
}

const DownloadPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const beforeInstallPromptEvent = event as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsSupported(true);
      console.log("Evento beforeinstallprompt acionado!"); // Adicionado para depuração
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      console.log("Chamando deferredPrompt.prompt()..."); // Adicionado para depuração
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Usuário aceitou a instalação do PWA");
        } else {
          console.log("Usuário não aceitou a instalação do PWA");
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <>
      <main className="flex items-center justify-center m-5 text-white">
        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-10">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-4xl font-bold font-mono mb-4 md:w-[440px]">
              Transforme sua produtividade com a Kyoto, instale agora nosso aplicativo mobile!
            </h1>
            {isSupported ? (
              <>
                <button
                  onClick={handleInstallClick}
                  className="flex justify-center items-center bg-transparente border-[3px] border-white hover:bg-white/70 hover:text-black text-[18px] font-bold w-80 py-5 rounded transition"
                >
                  <Download className="w-5 h-5 inline-block mr-2" /> Instalar nosso aplicativo
                </button>
              </>
            ) : (
              <p className="text-2xl text-red-600">
                Seu navegador não suporta a instalação do nosso aplicativo.
              </p>
            )}
          </div>
          <img
            src="/smartphone-download.png"
            alt="smartphone"
            className="w-screen md:w-[700px] h-auto"
          />
        </div>
      </main>
    </>
  );
};

export default DownloadPage;
