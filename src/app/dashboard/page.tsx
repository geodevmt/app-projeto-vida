"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, User, FileCheck, AlertCircle } from "lucide-react";
import { UploadForm } from "@/components/UploadForm"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- INTERFACES PARA TIPAGEM FORTE ---
interface DocumentFile {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  school: string | null;
  class_name: string | null;
  period: string | null;
  life_plan_url: string | null;
  cv_url: string | null;
  documents: DocumentFile[];
}
// ------------------------------------

// Definimos o estado inicial como um objeto vazio, mas tipado
const initialProfileState: ProfileData = {
    id: '', full_name: null, email: null, avatar_url: null, school: null, 
    class_name: null, period: null, life_plan_url: null, cv_url: null, documents: []
};


export default function Dashboard() {
  const { user, signOut, isLoading } = useAuth();
  const router = useRouter();
  
  // Substituímos 'any' pelo tipo ProfileData
  const [profile, setProfile] = useState<ProfileData>(initialProfileState);
  const [documents, setDocuments] = useState<DocumentFile[]>([]); 

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const fetchDocuments = async (userId: string) => {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    // Assegura que estamos usando a interface de documentos
    if (data) setDocuments(data as DocumentFile[]);
  };

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    // Assegura que estamos usando a interface de perfil
    if (data) setProfile(data as ProfileData);
    fetchDocuments(user.id);
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (isLoading || !user) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  const isProfileComplete = profile.school && profile.class_name;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-200">
               {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" alt="Foto" /> : <User className="h-full w-full p-3 text-gray-500" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Olá, {profile.full_name}</h1>
              <p className="text-gray-500">{profile.school || "Escola não informada"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/perfil")}><User className="mr-2 h-4 w-4" /> Editar Perfil</Button>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sair</Button>
          </div>
        </div>

        {!isProfileComplete && (
          <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Perfil Incompleto</AlertTitle>
            <AlertDescription>Complete seus dados (Escola, Turma) antes de enviar. <span className="font-bold underline cursor-pointer ml-1" onClick={() => router.push("/perfil")}>Clique aqui.</span></AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          
          <Card className="border-t-4 border-blue-500 shadow-md">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="text-blue-500" /> Plano de Vida</CardTitle><CardDescription>Envie seu documento .doc ou .pdf</CardDescription></CardHeader>
            <CardContent><UploadForm onUploadSuccess={loadProfile} label="Plano de Vida" /></CardContent>
          </Card>
          <Card className="border-t-4 border-green-500 shadow-md">
            <CardHeader><CardTitle className="flex items-center gap-2"><FileCheck className="text-green-500" /> Currículo</CardTitle><CardDescription>Envie seu CV .doc ou .pdf</CardDescription></CardHeader>
            <CardContent><UploadForm onUploadSuccess={loadProfile} label="Currículo Profissional" /></CardContent>
          </Card>
        </div>

        {/* Lista de Documentos Enviados */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Histórico de Envios</h2>
          {documents.length === 0 ? (
            <p className="text-gray-500 italic">Nenhum arquivo enviado ainda.</p>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-green-100 p-2"><FileCheck className="h-5 w-5 text-green-700" /></div>
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-xs text-gray-500">
                        Enviado em: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">Baixar</a>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}