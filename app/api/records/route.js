import pool from '@/lib/db';
import { NextResponse } from 'next/server';

// Rate limit simple en memoria
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const limit = 10; // peticiones
  const windowMs = 60 * 1000; // 1 minuto

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, last: now });
    return true;
  }

  const tracker = rateLimitMap.get(ip);
  if (now - tracker.last > windowMs) {
    tracker.count = 1;
    tracker.last = now;
    return true;
  }

  tracker.count++;
  return tracker.count <= limit;
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
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Límite de velocidad excedido' }, { status: 429 });
  }

  try {
    const { content } = await request.json();
    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
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