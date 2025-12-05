"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Precisamos instalar esse
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // E esse

// Schema de Validação (Regras de Negócio)
const profileSchema = z.object({
  full_name: z.string().min(3, "Nome muito curto"),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  school: z.string().min(3, "Informe o nome da escola"),
  class_name: z.string().min(1, "Informe a turma (Ex: 3º A)"),
  period: z.enum(["Manhã", "Tarde", "Noite"]),
  about_me: z.string().max(500, "Máximo 500 caracteres").optional(),
  dreams: z.string().max(500, "Máximo 500 caracteres").optional(),
  skills: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Carregar dados existentes
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        toast.error("Erro ao carregar perfil");
      } else if (data) {
        setValue("full_name", data.full_name || "");
        setValue("school", data.school || "");
        setValue("class_name", data.class_name || "");
        setValue("period", data.period || "Manhã");
        setValue("about_me", data.about_me || "");
        setValue("dreams", data.dreams || "");
        setValue("skills", data.skills || "");
        setValue("birth_date", data.birth_date || "");
        setAvatarUrl(data.avatar_url);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [user, setValue]);

  // Função de Upload de Avatar
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0] || !user) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    toast.info("Atualizando foto...");

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar foto");
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    // Atualiza no banco imediatamente para não perder
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setAvatarUrl(publicUrl);
    toast.success("Foto atualizada!");
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          last_updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Perfil salvo com sucesso!");
      router.push("/dashboard"); // Volta pro painel para enviar os arquivos
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
            <CardDescription>Mantenha seus dados atualizados para o professor.</CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* Avatar Section */}
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <Label htmlFor="avatar-upload" className="cursor-pointer text-sm text-blue-600 hover:underline">
                Alterar foto
              </Label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input {...register("full_name")} />
                  {errors.full_name && <p className="text-sm text-red-500">{errors.full_name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input type="date" {...register("birth_date")} />
                  {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Escola</Label>
                <Input placeholder="Nome da Escola Estadual..." {...register("school")} />
                {errors.school && <p className="text-sm text-red-500">{errors.school.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Input placeholder="Ex: 3º Ano B" {...register("class_name")} />
                  {errors.class_name && <p className="text-sm text-red-500">{errors.class_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <select 
                    {...register("period")} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noite">Noite</option>
                  </select>
                  {errors.period && <p className="text-sm text-red-500">{errors.period.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sobre Mim (Opcional)</Label>
                <Textarea placeholder="Conte um pouco sobre sua história..." {...register("about_me")} />
                {errors.about_me && <p className="text-sm text-red-500">{errors.about_me.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Meus Sonhos (Opcional)</Label>
                <Textarea placeholder="O que você quer ser no futuro?" {...register("dreams")} />
              </div>

              <div className="space-y-2">
                <Label>Habilidades (Opcional)</Label>
                <Textarea placeholder="Ex: Desenho, Matemática, Esportes..." {...register("skills")} />
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Perfil
              </Button>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}