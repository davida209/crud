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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Verificando integridad...');
    
    try {
      const formData = new FormData(e.currentTarget);
      let res;

      if (editingId) {
        res = await updateRecord(editingId, entry);
      } else {
        res = await createRecord(formData);
      }

      if (res?.error) {
        setMessage(res.error);
      } else {
        setMessage(editingId ? '¡Registro actualizado!' : '¡Registro guardado!');
        setEditingId(null);
        setEntry('');
        await fetchItems();
      }
    } catch (err) {
      setMessage('Error de comunicación con el servidor');
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-6 font-sans">
      <div className="max-w-xl mx-auto py-12">
        
        <header className="mb-10 border-b border-[#e2e1d5] pb-6 text-center">
          <h1 className="text-[10px] tracking-[0.4em] uppercase text-[#a3a292] font-bold mb-2">Seguridad Nivel 2</h1>
          <h2 className="text-2xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
          {message && (
            <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
              message.toLowerCase().includes('error') || message.includes('ESPERA') ? 'text-red-500' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="relative mb-12">
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input
            name="content"
            type="text"
            required
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={editingId ? "Modificando..." : "Escribir nueva entrada..."}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:ring-2 focus:ring-[#c2c1ad]"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[9px] uppercase px-5 py-2 rounded-full font-bold">
            {editingId ? 'Guardar' : 'Añadir'}
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-xs text-[#a3a292] animate-pulse">Sincronizando registros...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-center border border-[#e2e1d5] hover:shadow-sm transition-all">
                <div className="flex-1 pr-4">
                  <p className="text-sm break-words">{item.content}</p>
                  <p className="text-[8px] text-[#a3a292] mt-1 uppercase">ID: {item.id}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { setEditingId(item.id); setEntry(item.content); setMessage('Modo edición activo'); }} className="text-[9px] font-bold text-blue-500 hover:underline">EDITAR</button>
                  <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[9px] font-bold text-red-400 hover:underline">BORRAR</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}