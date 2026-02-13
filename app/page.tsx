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
        setMessage(editingId ? '¡Actualizado!' : '¡Añadido con éxito!');
        setEditingId(null);
        setEntry('');
        fetchItems();
      }
    } catch (err) {
      setMessage('Error de servidor');
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] p-4 md:p-12 text-[#4a4a44] font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LADO IZQUIERDO: Contenedor de Créditos */}
        <div className="lg:col-span-1">
          <div className="sticky top-12 bg-white border border-[#e2e1d5] p-8 rounded-3xl shadow-sm">
            <h3 className="text-[10px] tracking-[0.3em] uppercase font-bold text-[#a3a292] mb-6 border-b border-[#f1f0e8] pb-4">
              Integrantes
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-serif italic text-[#6b6a5d] bg-[#f9f8f4] p-4 rounded-xl border border-[#f1f0e8]">
                  Lester David Uicab Gongora
                </p>
              </div>
              <div>
                <p className="text-sm font-serif italic text-[#6b6a5d] bg-[#f9f8f4] p-4 rounded-xl border border-[#f1f0e8]">
                  Karem Borges Correa
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[#f1f0e8]">
              <p className="text-[9px] text-[#c2c1ad] uppercase tracking-widest">
                SDA &bull; 2026
              </p>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: CRUD Principal */}
        <div className="lg:col-span-2">
          <header className="mb-10 border-b border-[#e2e1d5] pb-6">
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

          <form onSubmit={handleSubmit} className="relative mb-12">
            <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input
              name="content"
              required
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="w-full bg-white border border-[#e2e1d5] rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-[#c2c1ad] transition-all shadow-sm"
              placeholder={editingId ? "Modificando entrada..." : "Escribir nueva entrada..."}
            />
            <button type="submit" className="mt-4 w-full md:w-auto md:absolute md:mt-0 right-3 top-1/2 md:-translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl font-bold hover:bg-[#4a4a44] transition-colors">
              {editingId ? 'Guardar' : 'Añadir'}
            </button>
          </form>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl flex justify-between items-center border border-[#e2e1d5] hover:border-[#c2c1ad] transition-all shadow-sm">
                <div className="flex-1 pr-6">
                  <p className="text-sm text-[#5a594e] leading-relaxed">{item.content}</p>
                  <p className="text-[9px] text-[#a3a292] mt-2 font-mono uppercase tracking-widest">ID: {item.id}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditingId(item.id); setEntry(item.content); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="text-[9px] font-bold text-blue-400 hover:text-blue-600 uppercase transition-colors">Editar</button>
                  <button onClick={async () => { if(confirm('¿Borrar?')) { await deleteRecord(item.id); fetchItems(); } }} className="text-[9px] font-bold text-red-300 hover:text-red-500 uppercase transition-colors">Borrar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}