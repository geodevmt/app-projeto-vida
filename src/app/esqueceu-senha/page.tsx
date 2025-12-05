"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Digite um e-mail válido"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setIsLoading(true);
    try {
      // Pega a URL atual do navegador para saber para onde voltar
      const redirectTo = `${window.location.origin}/atualizar-senha`;

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectTo,
      });

      if (error) throw error;

      toast.success("Se o e-mail existir, você receberá um link de recuperação.");
      
    } catch (error: any) {
      toast.error("Erro ao solicitar recuperação: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>Enviaremos um link para o seu e-mail.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Cadastrado</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  className="pl-9" 
                  placeholder="nome@exemplo.com" 
                  {...register("email")} 
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Link de Recuperação"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}