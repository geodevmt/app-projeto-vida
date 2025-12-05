"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, FileText, ExternalLink, Loader2 } from "lucide-react";
import { InviteTeacherDialog } from "@/components/InviteTeacherDialog"; // <--- Novo Componente de Convite

export default function AdminPanel() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(true);

  // 1. Verificação de Segurança (Apenas Professores)
  useEffect(() => {
    async function checkRole() {
      if (authLoading) return;
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role !== "teacher") {
        toast.error("Acesso negado. Área restrita a professores.");
        router.push("/dashboard");
      }
    }
    checkRole();
  }, [user, authLoading, router]);

  // 2. Buscar Dados dos Alunos e seus Documentos
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        setLoadingData(true);
        
        // Busca perfis de alunos e faz o join com a tabela de documentos
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            *,
            documents (*)
          `)
          .eq("role", "student") // Filtra apenas alunos
          .order("full_name");

        if (error) {
          console.error("Erro Supabase:", JSON.stringify(error, null, 2));
          toast.error("Erro ao carregar lista. Verifique o console.");
        } else {
          setStudents(profiles || []);
        }
      } catch (err) {
        console.error("Erro Crítico:", err);
        toast.error("Ocorreu um erro inesperado.");
      } finally {
        setLoadingData(false);
      }
    }

    // Só busca se o usuário estiver autenticado e não estiver carregando o auth
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  // Lógica de Filtro (Busca por nome ou escola)
  const filteredStudents = students.filter(s => 
    (s.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (s.school?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (authLoading || loadingData) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-500">Carregando painel docente...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Cabeçalho do Admin */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel do Professor</h1>
            <p className="text-gray-500">Gestão de Alunos e Projetos de Vida</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            
            {/* Botão de Convidar Outros Professores */}
            <InviteTeacherDialog />

            {/* Campo de Busca */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome ou escola..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botão de Logout */}
            <Button variant="destructive" size="icon" onClick={signOut} title="Sair do Sistema">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabela de Resultados */}
        <Card className="shadow-md border-gray-200">
          <CardHeader className="bg-gray-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Alunos Encontrados 
              <Badge variant="secondary">{filteredStudents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Aluno</TableHead>
                  <TableHead>Escola / Turma</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Arquivos Recebidos</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-gray-500">
                      Nenhum aluno encontrado com esse critério.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                           {/* Avatar com Fallback */}
                           <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200 text-blue-700 font-bold shrink-0">
                             {student.avatar_url ? (
                               <img src={student.avatar_url} className="h-full w-full object-cover" alt="Foto" />
                             ) : (
                               student.full_name?.charAt(0).toUpperCase() || "?"
                             )}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-gray-900 font-semibold">{student.full_name}</span>
                             <span className="text-xs text-gray-500">{student.email}</span>
                           </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-gray-700">{student.school || "Não informada"}</span>
                          <span className="text-xs text-gray-500">{student.class_name || "Sem turma"}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {student.period || "-"}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {/* Lista de Documentos */}
                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                          {student.documents && student.documents.length > 0 ? (
                            student.documents.map((doc: any) => (
                              <a 
                                key={doc.id} 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition border border-blue-100"
                                title={doc.file_name}
                              >
                                <FileText className="h-3 w-3" />
                                {doc.file_name.length > 12 ? doc.file_name.substring(0, 12) + "..." : doc.file_name}
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-orange-400 italic flex items-center gap-1">
                              Pendente
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right pr-6">
                         {/* Futuro: Botão para abrir perfil detalhado */}
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Ver Detalhes">
                           <ExternalLink className="h-4 w-4 text-gray-500" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}