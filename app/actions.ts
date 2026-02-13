'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// 1. ESQUEMA DE VALIDACIÓN (Zod)
// Define que el contenido debe ser texto, mínimo 1 caracter y máximo 500.
const RecordSchema = z.string()
  .min(1, { message: "El campo no puede estar vacío" })
  .max(500, { message: "El mensaje es demasiado largo (máximo 500 caracteres)" })
  .trim();

export async function createRecord(formData: FormData) {
  // Protección Honeypot
  if (formData.get('website_url')) return { error: 'Bot detectado' };

  // 2. VALIDACIÓN DE DATOS CON ZOD
  const contentInput = formData.get('content');
  const result = RecordSchema.safeParse(contentInput);

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  // 3. SANITIZACIÓN (DOMPurify)
  // Elimina cualquier intento de meter <script> o código malicioso.
  const cleanContent = DOMPurify.sanitize(result.data);

  const now = Date.now();

  try {
    // 4. RATE LIMIT (Escudo contra ataques masivos de Burp Suite)
    const [lastRows]: any = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (lastRows.length > 0) {
      const lastTime = new Date(lastRows[0].created_at).getTime();
      const diff = now - lastTime;
      if (diff < 60000) {
        return { error: `SISTEMA PROTEGIDO. Espera ${Math.ceil((60000 - diff) / 1000)} segundos.` };
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
  // Validar y sanitizar también al editar
  const result = RecordSchema.safeParse(content);
  if (!result.success) return { error: result.error.errors[0].message };
  
  const cleanContent = DOMPurify.sanitize(result.data);

  try {
    await pool.query('UPDATE records SET content = ? WHERE id = ?', [cleanContent, id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar registro' };
  }
}

export async function deleteRecord(id: number) {
  try {
    await pool.query('DELETE FROM records WHERE id = ?', [id]);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar registro' };
  }
}