'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Usamos un objeto global para el rate limit (en producción se usaría Redis, pero esto es más robusto que la API)
const rateLimitMap = new Map<string, number>();

export async function createRecord(formData: FormData) {
  const content = formData.get('content') as string;
  
  // 1. Validación básica
  if (!content || content.trim().length === 0) {
    return { error: 'El contenido no puede estar vacío.' };
  }

  // 2. Rate Limit Estricto (1 minuto)
  // Nota: En Vercel, tratamos de obtener la IP desde los headers
  const now = Date.now();
  const cooldown = 60 * 1000;
  
  // Simulamos un identificador (en Server Actions es mejor usar cookies o una IP fija si está disponible)
  const lastPost = rateLimitMap.get('global_user'); // Límite global temporal para frenar bots

  if (lastPost && (now - lastPost < cooldown)) {
    const secondsLeft = Math.ceil((cooldown - (now - lastPost)) / 1000);
    return { error: `Demasiado rápido. Espera ${secondsLeft} segundos.` };
  }

  try {
    // 3. Insertar en MySQL
    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    
    // 4. Actualizar tiempo del último post
    rateLimitMap.set('global_user', now);
    
    // 5. Refrescar la página automáticamente
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error en Action:', error);
    return { error: 'Error al conectar con la base de datos.' };
  }
}

export async function deleteRecord(id: number) {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'No se pudo eliminar.' };
  }
}