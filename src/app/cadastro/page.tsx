"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Info } from "lucide-react";

export default function CadastroMenu() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        <Button variant="ghost" onClick={() => router.push("/login")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Login
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Cadastro de Aluno</h1>
          <p className="text-gray-500">Crie sua conta para enviar os trabalhos.</p>
        </div>

        <Card 
          className="cursor-pointer border-2 border-blue-100 hover:border-blue-500 hover:shadow-lg transition-all"
          onClick={() => router.push("/cadastro/aluno")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
              <GraduationCap className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Sou Estudante</CardTitle>
            <CardDescription>
              Clique aqui para criar seu acesso, preencher seu perfil e enviar o Plano de Vida.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 items-start">
           <Info className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
           <div className="text-sm text-yellow-800">
             <strong>Atenção Professores:</strong> O cadastro de docentes é feito exclusivamente pela coordenação. 
             Verifique seu e-mail institucional para acessar o link de convite.
           </div>
        </div>
      </div>
    </div>
  );
}