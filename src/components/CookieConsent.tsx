"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Adicionamos um pequeno delay para evitar erro de hidratação e melhorar a UX
    const timer = setTimeout(() => {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        setIsVisible(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 p-4 text-white shadow-lg backdrop-blur-sm transition-all md:m-4 md:rounded-lg md:max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Respeitamos sua privacidade</h3>
            <p className="text-xs text-gray-300">
              Utilizamos cookies essenciais para manter sua sessão segura e garantir o funcionamento do portal.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button 
            onClick={handleAccept} 
            size="sm"
            className="bg-white text-gray-900 hover:bg-gray-100 whitespace-nowrap font-medium"
          >
            Entendi e Aceito
          </Button>
        </div>
      </div>
    </div>
  );
}