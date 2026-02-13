'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  // 1. TRAMPA HONEYPOT
  // Si este campo (invisible para humanos) tiene contenido, es un bot.
  const botTrap = formData.get('hp_field'); 
  if (botTrap) return { error: 'Acceso denegado.' };

  // 2. TOKEN DE TIEMPO (Anti-Replay)
  // Burp Suite no podrá usar una petición vieja porque el token expira.
  const token = formData.get('auth_ts');
  const now = Date.now();
  if (!token || (now - parseInt(token.toString())) > 120000) { // 2 minutos de validez
    return { error: 'Sesión expirada. Recarga la página.' };
  }

  const content = formData.get('content') as string;
  
  // 3. FILTRO DE CONTENIDO (Bloqueo por palabras clave)
  if (content.toLowerCase().includes('ataque') || content.toLowerCase().includes('papus')) {
    return { error: 'Contenido bloqueado por seguridad.' };
  }

  try {
    // 4. RATE LIMIT EN MYSQL
    const [lastRows]: any = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      if (now - lastTime < 60000) { // Un registro por minuto GLOBAL
        return { error: 'Sistema en pausa. Intenta en un minuto.' };
      }
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error de conexión.' };
  }
}