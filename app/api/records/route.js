import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Memoria para rastrear IPs y tiempos (Límite por persona)
const ipTracker = new Map();

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC LIMIT 50');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  // 1. Obtener la IP real del usuario
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const cooldown = 60 * 1000; // 60 segundos de espera

  // 2. Verificar si esta IP ya publicó recientemente
  if (ipTracker.has(ip)) {
    const lastPostTime = ipTracker.get(ip);
    const timeDiff = now - lastPostTime;

    if (timeDiff < cooldown) {
      const secondsLeft = Math.ceil((cooldown - timeDiff) / 1000);
      return NextResponse.json(
        { error: `Demasiado rápido. Espera ${secondsLeft} segundos.` },
        { status: 429 }
      );
    }
  }

  try {
    const { content } = await request.json();

    // 3. Validación básica de contenido para evitar textos gigantes
    if (!content || content.length > 300) {
      return NextResponse.json({ error: 'Texto demasiado largo o vacío' }, { status: 400 });
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
    
    // 4. Actualizar el rastro de la IP después de un éxito
    ipTracker.set(ip, now);

    return NextResponse.json({ message: 'Registrado' }, { status: 201 });
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