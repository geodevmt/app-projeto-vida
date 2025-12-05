"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link"; // <--- Importação necessária para o link funcionar

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema de validação
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new Error("E-mail ou senha incorretos.");
      }
      
      toast.success("Login realizado com sucesso!");
      router.push("/dashboard"); // O middleware ou a página vai redirecionar se for admin

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
      toast.error("Falha ao entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-blue-600">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Portal Projeto de Vida</CardTitle>
          <CardDescription>Acesso seguro para Alunos e Professores</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Institucional</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nome@escola.mt.gov.br" 
                {...register("email")} 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Campo Senha com Link de Recuperação */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link 
                  href="/esqueci-senha" 
                  className="text-xs text-blue-600 hover:underline font-medium"
                  tabIndex={-1} // Opcional: para não atrapalhar a tabulação rápida
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                {...register("password")} 
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Alerta de Erro */}
            {errorMsg && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de Acesso</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar no Sistema"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center bg-gray-50 py-4 rounded-b-lg">
          <p className="text-sm text-gray-500">
            É um aluno novo? <Link href="/cadastro" className="text-blue-700 font-semibold hover:underline">Criar conta de estudante</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}