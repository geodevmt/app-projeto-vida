"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";

// Schema de validação
const passwordSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function UpdatePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      // Atualiza a senha do usuário logado
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      toast.success("Senha atualizada com sucesso!");
      
      // Redireciona para o lugar certo dependendo do cargo
      // Como não temos acesso fácil ao profile aqui sem fazer fetch, mandamos pro dashboard genérico
      // e o middleware/authcontext cuida do resto ou o usuário navega.
      router.push("/login"); // Força login novo para garantir
      
    } catch (error: any) {
      toast.error("Erro ao atualizar senha: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Definir Nova Senha</CardTitle>
          <CardDescription>
            {user ? `Logado como: ${user.email}` : "Defina sua senha de acesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <Input type="password" {...register("password")} placeholder="******" />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Confirmar Nova Senha</Label>
              <Input type="password" {...register("confirmPassword")} placeholder="******" />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Salvar Senha"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
             <Button variant="link" onClick={() => router.push("/dashboard")}>
               <ArrowLeft className="mr-2 h-4 w-4" /> Pular e ir para o Painel
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}