import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json();

    // 1. Validação Básica
    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email e Nome são obrigatórios' }, { status: 400 });
    }

    // 2. Inicializa o Supabase com poderes de ADMIN
    // Usamos a chave SERVICE_ROLE que configuramos no .env.local
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 3. Envia o Convite Mágico
    // O Supabase vai mandar um e-mail para esse endereço contendo um link.
    // Ao clicar, o usuário é criado e o Trigger do banco vai ler o metadata "role: teacher".
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'teacher' // <--- O PULO DO GATO: Aqui definimos que ele nasce Professor
      }
    });

    if (error) {
      console.error('Erro Supabase Admin:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Convite enviado com sucesso!' });

  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}