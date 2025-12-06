import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email e Nome são obrigatórios' }, { status: 400 });
    }

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

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'teacher'
      }
    });

    if (error) {
      console.error('Erro Supabase Admin:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Convite enviado com sucesso!' });

  } catch (error) {
    // Correção aqui:
    const errorMessage = error instanceof Error ? error.message : "Erro interno no servidor";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}