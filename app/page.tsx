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
    setMessage('Procesando...');
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = editingId 
        ? await updateRecord(editingId, entry) 
        : await createRecord(formData);

      if (res && res.error) {
        setMessage(res.error);
      } else {
        setMessage(editingId ? '¡Actualizado!' : '¡Añadido!');
        setEditingId(null);
        setEntry('');
        fetchItems();
      }
    } catch (err) {
      setMessage('Error de servidor');
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] p-4 md:p-8 text-[#4a4a44] font-sans">
      {/* Contenedor fluido para permitir que se mueva a los extremos */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LADO IZQUIERDO: Ahora más estrecho (col-span-3) */}
        <div className="lg:col-span-3 xl:col-span-2">
          <div className="sticky top-8 bg-white border border-[#e2e1d5] p-6 rounded-2xl shadow-sm">
            <h3 className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#a3a292] mb-4 border-b border-[#f1f0e8] pb-2">
              Integrantes
            </h3>
            <div className="space-y-4">
              <div className="bg-[#f9f8f4] p-3 rounded-lg border border-[#f1f0e8]">
                <p className="text-[11px] font-serif italic text-[#6b6a5d]">
                  Lester David Uicab Gongora
                </p>
              </div>
              <div className="bg-[#f9f8f4] p-3 rounded-lg border border-[#f1f0e8]">
                <p className="text-[11px] font-serif italic text-[#6b6a5d]">
                  Karem Borges Correa
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#f1f0e8]">
              <p className="text-[8px] text-[#c2c1ad] uppercase tracking-tighter font-bold">
                SDA &bull; 2026
              </p>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: CRUD más amplio (col-span-9) */}
        <div className="lg:col-span-9 xl:col-span-8 lg:ml-4">
          <header className="mb-8 border-b border-[#e2e1d5] pb-6">
            <h2 className="text-3xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
            {message && (
              <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
                message.includes('Error') || message.includes('Espera') || message.includes('SISTEMA') 
                ? 'text-red-500' : 'text-green-600'
              }`}>
                {message}
              </p>
            )}
          </header>

          <form onSubmit={handleSubmit} className="relative mb-10">
            <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input
              name="content"
              required
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-white border border-[#e2e1d5] rounded-xl py-4 px-6 outline-none focus:ring-2 focus:ring-[#c2c1ad] transition-all"
              placeholder={editingId ? "Modificando..." : "Escribir nueva entrada..."}
            />
            <button type="submit" className="mt-4 w-full md:w-auto md:absolute md:mt-0 right-2 top-1/2 md:-translate-y-1/2 bg-[#6b6a5d] text-white text-[9px] uppercase tracking-widest px-6 py-2.5 rounded-lg font-bold hover:bg-[#4a4a44]">
              {editingId ? 'Guardar' : 'Añadir'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-xl flex justify-between items-start border border-[#e2e1d5] hover:border-[#c2c1ad] transition-all shadow-sm">
                <div className="flex-1 pr-4">
                  <p className="text-sm text-[#5a594e] leading-relaxed mb-2">{item.content}</p>
                  <p className="text-[8px] text-[#a3a292] font-mono uppercase">ID: {item.id}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setEditingId(item.id); setEntry(item.content); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[9px] font-bold text-blue-400 hover:text-blue-600 uppercase">Editar</button>
                  <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[9px] font-bold text-red-300 hover:text-red-500 uppercase">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}