'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  // 1. TRAMPA HONEYPOT
  // Si este campo viene lleno, es un bot (porque es invisible para humanos)
  const botTrap = formData.get('website_url');
  if (botTrap) {
    return { error: 'Acceso denegado: Actividad sospechosa detectada.' };
  }

  const content = formData.get('content') as string;
  
  // 2. VALIDACIÓN DE CONTENIDO BÁSICA
  if (!content || content.trim().length === 0) {
    return { error: 'El contenido no puede estar vacío.' };
  }

  // Filtro contra los ataques que recibiste
  if (content.toLowerCase().includes('ataque') || content.toLowerCase().includes('bot')) {
    return { error: 'Contenido bloqueado por las reglas de seguridad.' };
  }

  const now = Date.now();
  const cooldown = 60 * 1000; // 60 segundos

  try {
    // 3. RATE LIMIT REAL DESDE LA BASE DE DATOS
    // Buscamos el último registro en MySQL para comparar el tiempo
    const [lastRows]: any = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      const diff = now - lastTime;

      if (diff < cooldown) {
        const secondsLeft = Math.ceil((cooldown - diff) / 1000);
        return { error: `SISTEMA PROTEGIDO. Espera ${secondsLeft} segundos para publicar.` };
      }
    }

    // 4. INSERCIÓN SEGURA (Consulta preparada)
    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    
    // 5. REVALIDACIÓN
    // Esto limpia la caché de Next.js para que el nuevo mensaje aparezca al instante
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    console.error('Error en Action:', error);
    return { error: 'Error de conexión con la base de datos de Aiven.' };
  }
}