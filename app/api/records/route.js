import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Memoria para rastrear el último envío por IP
const postTracker = new Map();

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC LIMIT 100');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// MÉTODO POST PROTEGIDO
export async function POST(request) {
  // 1. Identificar al usuario por su IP
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const cooldown = 60000; // 60 segundos exactos

  // 2. Verificar Rate Limit
  if (postTracker.has(ip)) {
    const lastPostTime = postTracker.get(ip);
    const timeDiff = now - lastPostTime;

    if (timeDiff < cooldown) {
      const secondsLeft = Math.ceil((cooldown - timeDiff) / 1000);
      return NextResponse.json(
        { error: `Protección activa. Espera ${secondsLeft} segundos para publicar de nuevo.` },
        { status: 429 }
      );
    }
  }

  try {
    const { content } = await request.json();

    // 3. Validaciones de seguridad básicas
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'El contenido no puede estar vacío.' }, { status: 400 });
    }
    if (content.length > 500) {
      return NextResponse.json({ error: 'El texto es demasiado largo.' }, { status: 400 });
    }

    // 4. Insertar en MySQL
    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    
    // 5. Actualizar el rastro de la IP (Solo tras un éxito)
    postTracker.set(ip, now);

    return NextResponse.json({ message: 'Registrado con éxito' }, { status: 201 });
  } catch (error) {
    console.error('Error en POST:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
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