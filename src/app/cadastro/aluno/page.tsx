"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- VALIDAÇÃO DE SENHA FORTE ---
const registerSchema = z.object({
  fullName: z.string().min(3, "O nome deve ter no mínimo 3 letras"),
  email: z.string().email("Digite um e-mail válido"),
  password: z.string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/[a-z]/, "Precisa conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Precisa conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Precisa conter pelo menos um número")
    .regex(/[^a-zA-Z0-9]/, "Precisa conter um símbolo (ex: ! @ # $ %)"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function StudentRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "student"
          },
        },
      });

      if (error) throw error;

      toast.success("Conta criada com sucesso!");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (error: any) {
      console.error("Erro original:", error);

      // --- TRADUTOR DE ERROS ATUALIZADO ---
      let cleanMessage = "Ocorreu um erro ao criar a conta.";
      
      const msg = error.message || "";

      if (msg.includes("Password should contain")) {
        // Captura o erro específico de senha forte do Supabase
        cleanMessage = "A senha é muito fraca. Use letras maiúsculas, minúsculas, números e símbolos.";
      } else if (msg.includes("Password should be")) {
        cleanMessage = "A senha deve ter no mínimo 6 caracteres.";
      } else if (msg.includes("User already registered") || msg.includes("unique constraint")) {
        cleanMessage = "Este e-mail já está cadastrado. Tente fazer login.";
      } else if (msg.includes("invalid email")) {
        cleanMessage = "O formato do e-mail é inválido.";
      } else {
        cleanMessage = msg; // Erro genérico
      }

      toast.error(cleanMessage);
      setServerError(cleanMessage); 

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-blue-700">Cadastro de Aluno</CardTitle>
          <CardDescription>Crie sua conta para acessar o portal</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input placeholder="Seu nome" {...register("fullName")} />
              {errors.fullName && <p className="text-red-500 text-xs font-medium">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" placeholder="email@escola.com" {...register("email")} />
              {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" placeholder="Ex: Senha@123" {...register("password")} />
              {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
              <p className="text-[10px] text-gray-400">
                Requisito: Letra Maiúscula, Minúscula, Número e Símbolo.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Confirmar Senha</Label>
              <Input type="password" placeholder="Repita a senha" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atenção</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Criar Conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm bg-gray-50 py-4 rounded-b-lg">
           Já tem conta? <a href="/login" className="text-blue-600 font-semibold hover:underline ml-1">Fazer Login</a>
        </CardFooter>
      </Card>
    </div>
  );
}