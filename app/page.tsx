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
    } catch (e) { console.error(e); }
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
    <main className="min-h-screen bg-[#f9f8f4] p-4 md:p-12 text-[#4a4a44] font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full flex-grow">
        
        <header className="mb-12 text-center border-b border-[#e2e1d5] pb-8">
          <h2 className="text-4xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
          {message && (
            <p className={`mt-4 text-[10px] font-bold uppercase tracking-[0.3em] ${
              message.includes('Error') || message.includes('Espera') 
              ? 'text-red-500' : 'text-green-600'
            }`}>
              {message}
            </p>
          )}
        </header>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="relative mb-16">
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input
            name="content"
            required
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-white border border-[#e2e1d5] rounded-2xl py-6 px-8 outline-none focus:ring-2 focus:ring-[#c2c1ad] shadow-sm text-lg"
            placeholder={editingId ? "Modificando..." : "Escribir nueva entrada..."}
          />
          <button type="submit" className="mt-4 w-full md:w-auto md:absolute md:mt-0 right-3 top-1/2 md:-translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] uppercase tracking-widest px-10 py-4 rounded-xl font-bold hover:bg-[#4a4a44] transition-all">
            {editingId ? 'Guardar' : 'Añadir'}
          </button>
        </form>

        {/* Lista de Registros - Una sola columna */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl flex justify-between items-center border border-[#e2e1d5] hover:border-[#c2c1ad] transition-all shadow-sm w-full">
              <div className="flex-1 pr-6">
                <p className="text-sm text-[#5a594e] leading-relaxed mb-2">{item.content}</p>
                <p className="text-[9px] text-[#a3a292] font-mono uppercase">ID: {item.id}</p>
              </div>
              <div className="flex gap-6">
                <button onClick={() => { setEditingId(item.id); setEntry(item.content); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[10px] font-bold text-blue-400 hover:text-blue-600 uppercase">Editar</button>
                <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[10px] font-bold text-red-300 hover:text-red-500 uppercase">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con el GIF solicitado */}
      <footer className="w-full max-w-3xl mt-24 border-t border-[#e2e1d5] pt-12 pb-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="flex flex-col gap-4 text-center md:text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c2c1ad] font-bold">Integrantes</p>
            <div className="space-y-3">
              <div className="bg-white border border-[#f1f0e8] px-6 py-3 rounded-xl shadow-sm">
                <p className="text-sm font-serif italic text-[#6b6a5d]">Lester David Uicab Gongora</p>
              </div>
              <div className="bg-white border border-[#f1f0e8] px-6 py-3 rounded-xl shadow-sm">
                <p className="text-sm font-serif italic text-[#6b6a5d]">Karem Borges Correa</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            {/* GIF: Hacker con laptop solicitado */}
            <img 
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGxrNDFjNHQxanFieWNiazJyY2lkM2M5ZzlkMTNsdWl4a2Z4N2xocCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YQitE4YNQNahy/giphy.gif" 
              alt="Hacker Hacker" 
              className="w-40 h-auto object-cover rounded-2xl shadow-xl grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105 transform"
            />
            <p className="text-[9px] tracking-[0.6em] text-[#a3a292] uppercase font-bold">
              v2.0 &bull; 2026
            </p>
          </div>

        </div>
      </footer>
    </main>
  );
}