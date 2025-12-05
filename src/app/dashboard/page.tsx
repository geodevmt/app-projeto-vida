"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, User, FileCheck, AlertCircle } from "lucide-react";
import { UploadForm } from "@/components/uploadForm"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (isLoading || !user) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  // Verifica se o perfil está completo
  const isProfileComplete = profile?.school && profile?.class_name;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
               {profile?.avatar_url ? (
                 <img src={profile.avatar_url} alt="Foto" className="h-full w-full object-cover" />
               ) : (
                 <User className="h-full w-full p-3 text-gray-500" />
               )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Olá, {profile?.full_name}</h1>
              <p className="text-gray-500">{profile?.school || "Escola não informada"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/perfil")}>
              <User className="mr-2 h-4 w-4" /> Editar Perfil
            </Button>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
          </div>
        </div>

        {!isProfileComplete && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Perfil Incompleto</AlertTitle>
            <AlertDescription>
              Você precisa completar seus dados (Escola, Turma) antes de enviar os trabalhos. 
              <span className="font-bold underline cursor-pointer ml-1" onClick={() => router.push("/perfil")}>Clique aqui.</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Slot 1: Plano de Vida */}
          <Card className="border-t-4 border-blue-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="text-blue-500" /> Plano de Ação (Vida)
              </CardTitle>
              <CardDescription>Envie seu documento .doc, .docx ou .pdf</CardDescription>
            </CardHeader>
            <CardContent>
               {/* Aqui reutilizamos o UploadForm, mas idealmente passariamos uma prop "type='plan'" 
                   para salvar na coluna certa. Por enquanto, mantém genérico. */}
               <UploadForm onUploadSuccess={loadProfile} />
               
               {/* Se quiser mostrar se já enviou, verifique no banco os documentos */}
            </CardContent>
          </Card>

          {/* Slot 2: Currículo */}
          <Card className="border-t-4 border-green-500 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="text-green-500" /> Currículo Profissional
              </CardTitle>
              <CardDescription>Envie seu CV atualizado .doc, .docx ou .pdf</CardDescription>
            </CardHeader>
            <CardContent>
               <UploadForm onUploadSuccess={loadProfile} />
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center text-xs text-gray-400 mt-10">
          <p>Portal Seguro | Em conformidade com a LGPD</p>
          <p>Seus dados são visíveis apenas para seus professores.</p>
        </div>

      </div>
    </div>
  );
}