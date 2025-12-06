import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, School } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6 text-center">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-6 rounded-full bg-blue-100 p-6 shadow-xl ring-4 ring-blue-50"><GraduationCap className="h-16 w-16 text-blue-600" /></div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">Portal <span className="text-blue-600">Projeto de Vida</span></h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-600">Plataforma oficial para envio de planos de vida e currículos de MT.</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <Link href="/login"><Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg bg-blue-600 hover:bg-blue-700">Acessar Sistema <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
        <Link href="/cadastro"><Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50">Sou Aluno Novo</Button></Link>
      </div>
      <div className="mt-20 flex items-center gap-2 text-sm text-gray-400"><School className="h-4 w-4" /><span>Ambiente Seguro</span></div>
    </div>
  );
}