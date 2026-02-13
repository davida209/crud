import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Diccionario en memoria para rastrear el tiempo de la última publicación
const registrosDeTiempo = new Map();

function usuarioPuedePublicar(ip) {
  const ahora = Date.now();
  const tiempoDeEspera = 60 * 1000; // 60 segundos

  if (!registrosDeTiempo.has(ip)) {
    return true;
  }

  const ultimaVez = registrosDeTiempo.get(ip);
  return (ahora - ultimaVez) >= tiempoDeEspera;
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
  const ip = request.headers.get('x-forwarded-for') || 'anonimo';

  if (!usuarioPuedePublicar(ip)) {
    return NextResponse.json(
      { error: 'Por favor, espera un minuto entre cada publicación.' }, 
      { status: 429 }
    );
  }

  try {
    const { content } = await request.json();
    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
    
    // Guardar el momento exacto del éxito
    registrosDeTiempo.set(ip, Date.now());
    
    return NextResponse.json({ message: 'Registrado correctamente' }, { status: 201 });
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