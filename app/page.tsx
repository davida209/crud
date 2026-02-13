'use client';

import { useState, useEffect } from 'react';
import { createRecord, updateRecord, deleteRecord } from './actions';

export default function CrudPage() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al obtener registros", e);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Procesando seguridad...');
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = editingId 
        ? await updateRecord(editingId, entry) 
        : await createRecord(formData);

      if (res && res.error) {
        setMessage(res.error);
      } else {
        setMessage(editingId ? '¡Actualizado con éxito!' : '¡Añadido con éxito!');
        setEditingId(null);
        setEntry('');
        fetchItems();
      }
    } catch (err) {
      setMessage('Error crítico de servidor');
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] p-6 text-[#4a4a44]">
      <div className="max-w-xl mx-auto py-12">
        <header className="mb-10 text-center border-b border-[#e2e1d5] pb-6">
          <h1 className="text-[10px] tracking-widest uppercase font-bold text-[#a3a292] mb-2">Seguridad Nivel 2</h1>
          <h2 className="text-2xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
          {message && (
            <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
              message.includes('Error') || message.includes('Espera') || message.includes('SISTEMA') 
              ? 'text-red-500' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="relative mb-12">
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input
            name="content"
            required
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#c2c1ad] transition-all"
            placeholder={editingId ? "Modificando..." : "Escribir nueva entrada..."}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[9px] px-5 py-2 rounded-full font-bold hover:bg-[#4a4a44]">
            {editingId ? 'Guardar' : 'Añadir'}
          </button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-center border border-[#e2e1d5] hover:shadow-sm transition-all">
              <div className="flex-1 pr-4">
                <p className="text-sm break-words">{item.content}</p>
                <p className="text-[8px] text-[#a3a292] mt-1 uppercase">Registro ID: {item.id}</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setEditingId(item.id); setEntry(item.content); setMessage('Modo edición'); }} className="text-[9px] font-bold text-blue-500 uppercase">Editar</button>
                <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[9px] font-bold text-red-400 uppercase">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}