import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC LIMIT 50');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // BLOQUEO ANTISPAM: Verificar el tiempo del último mensaje global
    const [lastEntry] = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastEntry.length > 0) {
      const lastTime = new Date(lastEntry[0].created_at).getTime();
      const now = Date.now();
      const diff = (now - lastTime) / 1000;

      if (diff < 60) { // Si han pasado menos de 60 segundos
        return NextResponse.json(
          { error: `Espera ${Math.ceil(60 - diff)} segundos.` }, 
          { status: 429 }
        );
      }
    }

    const { content } = await request.json();
    
    // Validación extra: si el contenido es muy largo o repetitivo, bloquear
    if (!content || content.length > 200) {
      return NextResponse.json({ error: 'Contenido no válido' }, { status: 400 });
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
    return NextResponse.json({ message: 'OK' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}