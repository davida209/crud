'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createRecord(formData: FormData) {
  if (formData.get('website_url')) return { error: 'Bot detectado' };
  const content = formData.get('content') as string;
  const now = Date.now();

  try {
    const [lastRows]: any = await pool.query('SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1');
    if (lastRows.length > 0) {
      const diff = now - new Date(lastRows[0].created_at).getTime();
      if (diff < 60000) return { error: `Espera ${Math.ceil((60000 - diff) / 1000)}s` };
    }
    await pool.query('INSERT INTO records (content) VALUES (?)', [content.trim()]);
    revalidatePath('/');
    return { success: true };
  } catch (error) { return { error: 'Error de conexión' }; }
}

// NUEVA FUNCIÓN: Actualizar registro
export async function updateRecord(id: number, content: string) {
  try {
    if (!content.trim()) return { error: 'El contenido no puede estar vacío.' };
    await pool.query('UPDATE records SET content = ? WHERE id = ?', [content.trim(), id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) { return { error: 'Error al actualizar' }; }
}

export async function deleteRecord(id: number) {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) { return { error: 'Error al eliminar' }; }
}