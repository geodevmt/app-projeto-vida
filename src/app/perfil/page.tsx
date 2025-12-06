"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const profileSchema = z.object({
  full_name: z.string().min(3, "Nome muito curto"),
  birth_date: z.string().optional(),
  school: z.string().min(3, "Informe a escola"),
  class_name: z.string().min(1, "Informe a turma"),
  period: z.enum(["Manhã", "Tarde", "Noite"]),
  about_me: z.string().optional(),
  dreams: z.string().optional(),
  skills: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setValue("full_name", data.full_name || "");
        setValue("birth_date", data.birth_date || "");
        setValue("school", data.school || "");
        setValue("class_name", data.class_name || "");
        setValue("period", data.period || "Manhã");
        setValue("about_me", data.about_me || "");
        setValue("dreams", data.dreams || "");
        setValue("skills", data.skills || "");
        setAvatarUrl(data.avatar_url);
      }
      setIsLoading(false);
    }
    load();
  }, [user, setValue]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const path = `${user.id}/avatar.${file.name.split('.').pop()}`;
    toast.info("Enviando foto...");
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setAvatarUrl(publicUrl);
    toast.success("Foto atualizada!");
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from("profiles").update({ ...data, last_updated_at: new Date().toISOString() }).eq("id", user.id);
    setIsSaving(false);
    if (error) toast.error("Erro ao salvar");
    else { toast.success("Salvo!"); router.push("/dashboard"); }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
        <Card>
          <CardHeader><CardTitle>Meu Perfil</CardTitle><CardDescription>Mantenha atualizado.</CardDescription></CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full border bg-gray-100 overflow-hidden">{avatarUrl ? <img src={avatarUrl} className="object-cover h-full w-full" /> : <Camera className="h-8 w-8 m-auto mt-8 text-gray-400" />}</div>
              <label className="text-sm text-blue-600 cursor-pointer hover:underline">Alterar foto<input type="file" hidden accept="image/*" onChange={handleAvatarUpload} /></label>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Nome</Label><Input {...register("full_name")} /></div>
                <div><Label>Nascimento</Label><Input type="date" {...register("birth_date")} /></div>
              </div>
              <div><Label>Escola</Label><Input {...register("school")} /></div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label>Turma</Label><Input {...register("class_name")} /></div>
                <div><Label>Período</Label><select {...register("period")} className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option></select></div>
              </div>
              <div><Label>Sobre Mim</Label><Textarea {...register("about_me")} /></div>
              <Button className="w-full" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}