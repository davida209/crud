'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const schema = z.string().min(1, "Escribe algo").max(500, "Máximo 500 caracteres");

export async function createRecord(formData: FormData) {
  if (formData.get('website_url')) return { error: 'Bot detectado' };

  const contentInput = formData.get('content');
  const validation = schema.safeParse(contentInput);

  if (!validation.success) {
    return { error: validation.error.issues[0].message };
  }

  // Sanitización profesional compatible con Vercel
  const cleanContent = sanitizeHtml(validation.data, {
    allowedTags: [], // No permitimos ninguna etiqueta HTML (máxima seguridad)
    allowedAttributes: {},
  });

  try {
    const [last]: any = await pool.query('SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1');
    if (last && last.length > 0) {
      const diff = Date.now() - new Date(last[0].created_at).getTime();
      if (diff < 60000) return { error: `Espera ${Math.ceil((60000 - diff) / 1000)}s` };
    }

    await pool.query('INSERT INTO records (content) VALUES (?)', [cleanContent]);
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Error de base de datos' };
  }
}

export async function updateRecord(id: number, content: string) {
  const validation = schema.safeParse(content);
  if (!validation.success) return { error: validation.error.issues[0].message };
  
  const clean = sanitizeHtml(validation.data, { allowedTags: [], allowedAttributes: {} });

  try {
    await pool.query('UPDATE records SET content = ? WHERE id = ?', [clean, id]);
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Error al actualizar' };
  }
}

export async function deleteRecord(id: number) {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { error: 'Error al eliminar' };
  }
}