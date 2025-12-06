"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, MailPlus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteTeacherDialog() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName: name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar convite");
      }

      toast.success(`Convite enviado para ${email}!`);
      setIsOpen(false);
      setEmail("");
      setName("");
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro desconhecido.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <MailPlus className="mr-2 h-4 w-4" /> Convidar Professor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Docente</DialogTitle>
          <DialogDescription>
            O professor receberá um link de acesso único por e-mail.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Professor</Label>
            <Input
              id="name"
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail Institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="professor@escola.mt.gov.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
            Enviar Convite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}