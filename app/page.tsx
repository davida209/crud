'use client';

import { useState, useEffect } from 'react';
import { createRecord, updateRecord, deleteRecord } from './actions';

export default function CrudPage() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    const res = await fetch('/api/records');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchItems(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Procesando...');
    
    const formData = new FormData(e.currentTarget);

    if (editingId) {
      // MODO EDICIÓN
      const res = await updateRecord(editingId, entry);
      if (res?.error) setMessage(res.error);
      else {
        setEditingId(null);
        setEntry('');
        setMessage('Registro actualizado.');
        fetchItems();
      }
    } else {
      // MODO CREACIÓN
      const res = await createRecord(formData);
      if (res?.error) setMessage(res.error);
      else {
        setEntry('');
        setMessage('Registro guardado.');
        fetchItems();
      }
    }
  }

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEntry(item.content);
    setMessage(`Editando registro #${item.id}`);
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-6">
      <div className="max-w-xl mx-auto py-16">
        
        <header className="mb-12 border-b border-[#e2e1d5] pb-6 text-center">
          <h1 className="text-xs tracking-[0.3em] uppercase text-[#a3a292] font-bold mb-3">
            CRUD Formulario
          </h1>
          {message && (
            <p className="text-[10px] font-bold uppercase text-orange-400">{message}</p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="relative mb-16">
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} />
          <input
            name="content"
            type="text"
            required
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={editingId ? "Editando registro..." : "Escribe algo..."}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] uppercase px-5 py-2 rounded-full font-bold">
            {editingId ? 'Guardar' : 'Añadir'}
          </button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-center border border-transparent hover:border-[#e2e1d5]">
              <div>
                <p className="text-sm text-[#5a594e]">{item.content}</p>
                <span className="text-[9px] text-[#a3a292] uppercase">ID {item.id}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => startEdit(item)} className="text-[9px] uppercase font-bold text-blue-400">Editar</button>
                <button onClick={async () => { await deleteRecord(item.id); fetchItems(); }} className="text-[9px] uppercase font-bold text-red-400">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}