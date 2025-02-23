import type { Metadata } from "next";

import "../styles/globals.css";

import { ChatProvider } from "@/providers/chatProvider";

export const metadata: Metadata = {
  title: "Kyoto",
  description:
    "Kyoto uma aplicação feita para poder agilizar o seu dia a dia com respostas inteligentes e rápidas, ultimamente desenvolvida utilizando as melhores tecnlogias do mercado.",
  icons: "/chatbot-icon.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className="bg-zinc-900 text-white">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
