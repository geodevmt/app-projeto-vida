"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, School, ArrowLeft } from "lucide-react";

export default function CadastroMenu() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Button variant="ghost" onClick={() => router.push("/login")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Login
        </Button>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Crie sua conta</h1>
          <p className="text-gray-500">Selecione seu perfil para continuar</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Opção Aluno */}
          <Card 
            className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
            onClick={() => router.push("/cadastro/aluno")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Sou Aluno</CardTitle>
              <CardDescription>Para enviar Projetos de Vida e Currículos.</CardDescription>
            </CardHeader>
          </Card>

          {/* Opção Professor */}
          <Card 
            className="cursor-pointer hover:border-green-500 hover:shadow-lg transition-all"
            onClick={() => router.push("/cadastro/professor")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                <School className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Sou Professor</CardTitle>
              <CardDescription>Para gerenciar turmas e avaliar projetos.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}