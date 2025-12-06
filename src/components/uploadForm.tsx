"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { UploadCloud, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// Configurações de Segurança
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
];

interface UploadFormProps {
  onUploadSuccess: () => void;
  label?: string; 
}

export function UploadForm({ onUploadSuccess, label = "Selecionar Arquivo" }: UploadFormProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast.error("Formato inválido. Apenas PDF ou Word (.doc, .docx).");
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    setProgress(10);

    try {
      // 1. Sanitiza o nome
      const cleanName = file.name
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.-]/g, "_");
      
      const timestamp = Date.now();
      const filePath = `${user.id}/${timestamp}_${cleanName}`;

      // 2. Upload para o Storage
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, { upsert: false });

      if (storageError) throw storageError;

      setProgress(60);

      // 3. Pegar URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(filePath);

      // 4. Salvar referência no Banco
      const { error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          content_type: file.type,
          size_bytes: file.size
        });

      if (dbError) throw dbError;

      setProgress(100);
      toast.success("Arquivo enviado com sucesso!");
      setFile(null);
      onUploadSuccess(); 

    } catch (error: unknown) { // <--- Tratamento de erro seguro
      console.error(error);
      
      let errorMessage = "Ocorreu um erro desconhecido no upload.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (typeof error === "object" && error !== null && "message" in error) {
        errorMessage = String((error as { message: unknown }).message);
      }

      toast.error("Erro: " + errorMessage);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center hover:bg-gray-50 transition-colors">
      {!file ? (
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <UploadCloud className="h-6 w-6 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              {label}
            </p>
            <p className="text-xs text-gray-400">PDF, DOC ou DOCX (Max. 10MB)</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileSelect}
            />
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 mt-2">
              Escolher Arquivo
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-md border bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="rounded bg-blue-100 p-2 shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading} className="shrink-0">
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>

          {isUploading && <Progress value={progress} className="h-2 w-full" />}

          <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Envio
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}