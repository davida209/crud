'use client';

import { useState, useEffect } from 'react';
import { createRecord, updateRecord, deleteRecord } from './actions';

export default function CrudPage() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Validando seguridad...');
    const formData = new FormData(e.currentTarget);

    const res = editingId 
      ? await updateRecord(editingId, entry) 
      : await createRecord(formData);

    if (res?.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setEditingId(null);
      setEntry('');
      setMessage(editingId ? 'Cambios guardados con éxito' : 'Registro creado con éxito');
      fetchItems();
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-6 font-sans">
      <div className="max-w-xl mx-auto py-12">
        <header className="mb-10 border-b border-[#e2e1d5] pb-6 text-center">
          <h1 className="text-[10px] tracking-[0.4em] uppercase text-[#a3a292] font-bold mb-2">Seguridad Avanzada</h1>
          <h2 className="text-2xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
          {message && (
            <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
              message.includes('Error') || message.includes('SISTEMA') ? 'text-red-500' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="relative mb-12">
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} />
          <input
            name="content"
            type="text"
            required
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={editingId ? "Editando..." : "Nueva entrada (Max 500 carac.)..."}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#c2c1ad]"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[9px] uppercase px-5 py-2 rounded-full font-bold">
            {editingId ? 'Actualizar' : 'Añadir'}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? <p className="text-center text-xs animate-pulse">Conectando...</p> : 
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-center border border-[#e2e1d5]">
                <div className="overflow-hidden">
                  <p className="text-sm break-words">{item.content}</p>
                  <p className="text-[8px] text-[#a3a292] uppercase mt-1">ID {item.id}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button onClick={() => { setEditingId(item.id); setEntry(item.content); }} className="text-[9px] font-bold text-blue-500">EDITAR</button>
                  <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[9px] font-bold text-red-400">BORRAR</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </main>
  );
}