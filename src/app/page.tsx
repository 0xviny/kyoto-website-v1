"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const Router = useRouter();

  useEffect(() => {
    Router.push("/chat");
  }, []);

  return <></>;
}
