'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Esquema de validación con Zod
const RecordSchema = z.string()
  .min(1, "El mensaje no puede estar vacío")
  .max(500, "Máximo 500 caracteres");

export async function createRecord(formData: FormData) {
  // Trampa Honeypot
  if (formData.get('website_url')) return { error: 'Bot detectado' };

  const contentInput = formData.get('content');
  const validation = RecordSchema.safeParse(contentInput);

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  // Sanitización de HTML malicioso
  const cleanContent = DOMPurify.sanitize(validation.data);
  const now = Date.now();

  try {
    // Rate Limit Global (1 minuto)
    const [lastRows]: any = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      const diff = now - lastTime;
      if (diff < 60000) {
        return { error: `SISTEMA PROTEGIDO. Espera ${Math.ceil((60000 - diff) / 1000)}s` };
      }
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [cleanContent]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error de conexión con la base de datos' };
  }
}

export async function updateRecord(id: number, content: string) {
  const validation = RecordSchema.safeParse(content);
  if (!validation.success) return { error: validation.error.errors[0].message };
  
  const cleanContent = DOMPurify.sanitize(validation.data);

  try {
    await pool.query('UPDATE records SET content = ? WHERE id = ?', [cleanContent, id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar' };
  }
}

export async function deleteRecord(id: number) {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar' };
  }
}