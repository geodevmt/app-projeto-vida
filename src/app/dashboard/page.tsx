"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, User, FileCheck, AlertCircle, Loader2, Upload, Download, Eye } from "lucide-react"; 
import { UploadForm } from "@/components/UploadForm"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

// --- TYPES ---
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
}

const initialProfileState: ProfileData = {
  id: '',
  full_name: null,
  email: null,
  avatar_url: null,
  school: null,
  class_name: null,
  period: null,
  life_plan_url: null,
  cv_url: null,
};
// ------------------------------------

export default function Dashboard() {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData>(initialProfileState);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Redirecionamento de Segurança
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [user, isAuthLoading, router]);

  // 2. Funções para buscar dados
  const fetchUserDocuments = useCallback(async (userId: string): Promise<DocumentFile[]> => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data as DocumentFile[]) || [];
    } catch (err) {
      console.error("Erro ao buscar documentos:", err);
      setError("Não foi possível carregar os documentos");
      return [];
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      return data as ProfileData;
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setError("Não foi possível carregar o perfil");
      return null;
    }
  }, []);

  // 3. Função principal para carregar todos os dados
  const loadUserData = useCallback(async (userId: string) => {
    if (!userId) return;

    setIsFetchingData(true);
    setError(null);

    try {
      const [profileData, documentsData] = await Promise.all([
        fetchUserProfile(userId),
        fetchUserDocuments(userId),
      ]);

      if (profileData) {
        setProfile(profileData);
      }

      setDocuments(documentsData);
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err);
      setError("Falha ao carregar dados. Tente novamente.");
    } finally {
      setIsFetchingData(false);
    }
  }, [fetchUserProfile, fetchUserDocuments]);

  // 4. Efeito para carregar dados quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      loadUserData(user.id);
    }
  }, [user?.id, loadUserData]);

  // 5. Handlers
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  const handleUploadSuccess = useCallback(() => {
    if (user?.id) {
      loadUserData(user.id);
    }
  }, [user?.id, loadUserData]);

  // 6. Valores computados
  const isProfileComplete = useMemo(() => {
    return !!(profile.school && profile.class_name);
  }, [profile.school, profile.class_name]);

  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [documents]);

  // Verifica se há documentos pelo nome do arquivo
  const hasLifePlan = useMemo(() => 
    profile.life_plan_url !== null || 
    documents.some(doc => doc.file_name.toLowerCase().includes('plano') || doc.file_name.toLowerCase().includes('life')),
    [documents, profile.life_plan_url]
  );

  const hasCurriculum = useMemo(() => 
    profile.cv_url !== null ||
    documents.some(doc => doc.file_name.toLowerCase().includes('currículo') || doc.file_name.toLowerCase().includes('cv')),
    [documents, profile.cv_url]
  );

  // 7. Custom UploadForm para quando o perfil está incompleto
  const DisabledUploadForm = () => (
    <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center bg-gray-50">
      <div className="space-y-4 opacity-60">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Upload className="h-6 w-6 text-gray-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">
            Upload desabilitado
          </p>
          <p className="text-xs text-gray-400">Complete seu perfil primeiro</p>
        </div>
        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors border border-input bg-background h-9 px-4 py-2 mt-2 text-gray-400 cursor-not-allowed">
          Escolher Arquivo
        </div>
      </div>
    </div>
  );

  // 8. Renderização condicional
  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <header className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Usuário"}
                    fill
                    className="object-cover"
                    sizes="80px"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-blue-100">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Olá, {profile.full_name || "Usuário"}
                </h1>
                <div className="mt-1 space-y-1">
                  <p className="text-gray-600">
                    {profile.school || "Escola não informada"}
                  </p>
                  {profile.class_name && (
                    <p className="text-sm text-gray-500">
                      Turma: {profile.class_name}
                      {profile.period && ` • Período: ${profile.period}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/perfil")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Editar Perfil
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isProfileComplete && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Perfil Incompleto</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Complete seus dados (Escola e Turma) para uma melhor experiência.
              <Button
                variant="link"
                className="ml-2 h-auto p-0 text-yellow-800 underline"
                onClick={() => router.push("/perfil")}
              >
                Clique aqui para completar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Cards de Upload */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className={`border-t-4 border-blue-500 shadow-lg ${!isProfileComplete ? 'opacity-80' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="rounded-lg bg-blue-100 p-2">
                  <FileCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  Plano de Vida
                  {hasLifePlan && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      ✓ Enviado
                    </span>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Envie seu plano de vida em formato .doc, .docx ou .pdf
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileComplete ? (
                <UploadForm
                  onUploadSuccess={handleUploadSuccess}
                  label="Plano de Vida"
                />
              ) : (
                <>
                  <DisabledUploadForm />
                  <p className="mt-2 text-sm text-yellow-600 text-center">
                    Complete seu perfil para habilitar o upload
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={`border-t-4 border-green-500 shadow-lg ${!isProfileComplete ? 'opacity-80' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="rounded-lg bg-green-100 p-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  Currículo Profissional
                  {hasCurriculum && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      ✓ Enviado
                    </span>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Envie seu currículo em formato .doc, .docx ou .pdf
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileComplete ? (
                <UploadForm
                  onUploadSuccess={handleUploadSuccess}
                  label="Currículo Profissional"
                />
              ) : (
                <>
                  <DisabledUploadForm />
                  <p className="mt-2 text-sm text-yellow-600 text-center">
                    Complete seu perfil para habilitar o upload
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Envios */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Histórico de Envios
            </h2>
            {documents.length > 0 && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {documents.length} {documents.length === 1 ? 'documento' : 'documentos'}
              </span>
            )}
          </div>

          {isFetchingData ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          ) : sortedDocuments.length === 0 ? (
            <Card className="py-12 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nenhum arquivo enviado
              </h3>
              <p className="mt-2 text-gray-600">
                Faça o upload dos seus documentos acima para vê-los aqui.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sortedDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className="transition-all hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-3 ${
                        doc.file_name.toLowerCase().includes('plano') || doc.file_name.toLowerCase().includes('life')
                          ? 'bg-blue-50 text-blue-600' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {doc.file_name}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            doc.file_name.toLowerCase().includes('plano') || doc.file_name.toLowerCase().includes('life')
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {doc.file_name.toLowerCase().includes('plano') || doc.file_name.toLowerCase().includes('life') 
                              ? 'Plano de Vida' 
                              : 'Currículo'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(doc.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </a>
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a
                          href={doc.file_url}
                          download
                        >
                          <Download className="h-4 w-4" />
                          Baixar
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}