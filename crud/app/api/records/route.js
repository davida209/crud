import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM registros ORDER BY id DESC');
  return NextResponse.json(rows);
}

export async function POST(req) {
  const { content } = await req.json();
  await pool.query('INSERT INTO registros (content) VALUES (?)', [content]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  await pool.query('DELETE FROM registros WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}