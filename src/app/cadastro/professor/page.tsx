"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// SENHA MESTRA DA ESCOLA (Em produção, ideal usar variáveis de ambiente)
const SCHOOL_SECRET_CODE = "ESCOLA123"; 

const registerSchema = z.object({
  fullName: z.string().min(3, "Nome curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Min 6 caracteres"),
  confirmPassword: z.string(),
  secretCode: z.string().min(1, "O código de acesso é obrigatório"), // Campo extra
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function TeacherRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    // 1. Validação de Segurança (O Porteiro)
    if (data.secretCode !== SCHOOL_SECRET_CODE) {
      toast.error("Código de acesso da escola inválido. Solicite à direção.");
      return;
    }

    setIsLoading(true);
    try {
      // 2. Se a senha confere, cria conta com role 'teacher'
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: "teacher" // <--- Ouro: Aqui definimos que é professor
          },
        },
      });

      if (error) throw error;
      toast.success("Conta de professor criada com sucesso!");
      setTimeout(() => router.push("/admin"), 1500); // Manda direto pro Admin

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <Card className="w-full max-w-md border-green-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-12 h-12 flex items-center justify-center rounded-full mb-2">
             <ShieldCheck className="text-green-600" />
          </div>
          <CardTitle className="text-green-800">Área do Professor</CardTitle>
          <CardDescription>Acesso exclusivo para docentes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo de Segurança */}
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <Label className="text-yellow-800 flex items-center gap-2">
                <Lock className="h-3 w-3" /> Código de Acesso da Escola
              </Label>
              <Input 
                type="password" 
                placeholder="Solicite à coordenação" 
                className="mt-1 bg-white"
                {...register("secretCode")} 
              />
              {errors.secretCode && <p className="text-red-500 text-sm">{errors.secretCode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input {...register("fullName")} />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>E-mail Institucional</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Confirmar</Label>
                <Input type="password" {...register("confirmPassword")} />
              </div>
            </div>
            
            <Button className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Criar Conta Docente"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm">
           <a href="/cadastro" className="text-gray-500 hover:underline">Voltar ao Menu</a>
        </CardFooter>
      </Card>
    </div>
  );
}