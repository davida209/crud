import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
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
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}