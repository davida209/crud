'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  // 1. TRAMPA HONEYPOT
  const botTrap = formData.get('website_url'); // Campo que los humanos no ven
  if (botTrap) {
    console.log("Bot detectado por Honeypot");
    return { error: 'Acceso denegado.' };
  }

  // 2. TOKEN DE TIEMPO (Evita que Burp Suite repita peticiones viejas)
  const token = formData.get('auth_token');
  const now = Date.now();
  if (!token || (now - parseInt(token.toString())) > 300000) { // 5 minutos de validez
    return { error: 'Sesión expirada. Recarga la página.' };
  }

  const content = formData.get('content') as string;
  if (!content || content.trim().length === 0) return { error: 'Contenido vacío' };

  try {
    // 3. RATE LIMIT EN BASE DE DATOS (El último escudo)
    const [lastRows]: any = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      if (now - lastTime < 60000) {
        return { error: 'Espera un minuto.' };
      }
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error de servidor' };
  }
}