"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, FileText, ExternalLink, Loader2 } from "lucide-react";
import { InviteTeacherDialog } from "@/components/InviteTeacherDialog";

// --- TIPAGEM FORTE (Interfaces) ---
interface DocumentFile {
  id: string;
  file_name: string;
  file_url: string;
}

interface StudentProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  school: string | null;
  class_name: string | null;
  period: string | null;
  documents: DocumentFile[]; // Array de documentos
}
// ----------------------------------

export default function AdminPanel() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  // Substituímos <any[]> por <StudentProfile[]>
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(true);

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

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        setLoadingData(true);
        
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`
            id, full_name, email, avatar_url, school, class_name, period,
            documents (id, file_name, file_url)
          `)
          .eq("role", "student")
          .order("full_name");

        if (error) {
          console.error("Erro Supabase:", error);
          toast.error("Erro ao carregar lista.");
        } else {
          // O cast "as unknown as StudentProfile[]" garante ao TS que o retorno bate com nossa interface
          setStudents((profiles as unknown as StudentProfile[]) || []);
        }
      } catch (err) {
        console.error("Erro Crítico:", err);
        toast.error("Ocorreu um erro inesperado.");
      } finally {
        setLoadingData(false);
      }
    }

    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

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
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel do Professor</h1>
            <p className="text-gray-500">Gestão de Alunos</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <InviteTeacherDialog />
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Buscar..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="destructive" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="shadow-md border-gray-200">
          <CardHeader className="bg-gray-50/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Alunos <Badge variant="secondary">{filteredStudents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Aluno</TableHead>
                  <TableHead>Escola / Turma</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Arquivos</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-gray-500">
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-gray-50/50">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
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
                          <span className="font-medium text-gray-700">{student.school || "-"}</span>
                          <span className="text-xs text-gray-500">{student.class_name || "-"}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {student.period || "-"}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-2 max-w-[250px]">
                          {student.documents && student.documents.length > 0 ? (
                            student.documents.map((doc) => (
                              <a 
                                key={doc.id} 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition border border-blue-100"
                              >
                                <FileText className="h-3 w-3" />
                                {doc.file_name.substring(0, 10)}...
                              </a>
                            ))
                          ) : (
                            <span className="text-xs text-orange-400 italic">Pendente</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right pr-6">
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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