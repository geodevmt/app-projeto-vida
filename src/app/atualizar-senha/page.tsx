"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Validação de senha forte
const passwordSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function UpdatePassword() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  // Verifica se o usuário chegou aqui autenticado (pelo link do e-mail)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("Link inválido ou expirado.");
        router.push("/login");
      }
    });
  }, [router]);

  const onSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      router.push("/dashboard"); // Manda direto pro painel
      
    } catch (error: any) {
      toast.error("Erro ao salvar senha: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-green-500">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Definir Nova Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input id="password" type="password" {...register("password")} placeholder="******" />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="******" />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar e Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}