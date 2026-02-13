import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Memoria para el límite de 1 envío por minuto
const lastActionMap = new Map();

function canUserPost(ip) {
  const now = Date.now();
  const cooldown = 60 * 1000; // 60 segundos exactos

  if (!lastActionMap.has(ip)) {
    return true;
  }

  const lastTime = lastActionMap.get(ip);
  return (now - lastTime) >= cooldown;
}

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';

  // Bloqueo si no ha pasado el minuto
  if (!canUserPost(ip)) {
    return NextResponse.json(
      { error: 'Espera un minuto entre cada publicación.' }, 
      { status: 429 }
    );
  }

  try {
    const { content } = await request.json();
    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
    
    // Registrar el tiempo exacto del envío exitoso
    lastActionMap.set(ip, Date.now());
    
    return NextResponse.json({ message: 'Creado' }, { status: 201 });
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