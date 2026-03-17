import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { requestId, username } = await request.json();

    // 1. Panggil Kunci Master dari .env rahasia kita
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

    // Bikin koneksi Supabase spesial pakai akses Admin/Owner
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 2. Cari ID asli (UUID) si Pegawai berdasarkan usernamenya di tabel profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Username pegawai tidak ditemukan di database.' }, { status: 404 });
    }

    // 3. THE MAGIC: Paksa reset passwordnya pakai hak Admin!
    const newPassword = 'Auto7Karyawan!';
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    );

    if (authError) throw authError;

    // 4. Kalau sukses ganti password, baru kita ubah status di tabel request jadi Completed
    const { error: updateReqError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({ status: 'Completed', resolved_at: new Date().toISOString() })
      .eq('id', requestId);

    if (updateReqError) throw updateReqError;

    // Balas ke frontend kalau misi sukses
    return NextResponse.json({ success: true, message: 'Password berhasil direset ke sistem inti.' });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}