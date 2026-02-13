import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM records ORDER BY id DESC');
    return NextResponse.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
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