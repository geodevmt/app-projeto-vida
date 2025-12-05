"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se já aceitou
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 p-4 text-white shadow-lg backdrop-blur-sm transition-all md:m-4 md:rounded-lg md:max-w-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-semibold">Respeitamos sua privacidade</h3>
            <p className="text-sm text-gray-300">
              Utilizamos cookies essenciais para manter sua sessão segura (Login) e garantir o funcionamento do portal. Nenhum dado é vendido a terceiros.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            onClick={handleAccept} 
            className="bg-white text-gray-900 hover:bg-gray-100 whitespace-nowrap"
          >
            Entendi e Aceito
          </Button>
        </div>
      </div>
    </div>
  );
}