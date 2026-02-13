'use client';

import { useState, useEffect } from 'react';
import { createRecord } from './actions'; // Importación corregida

export default function BitacoraPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function handleSubmit(formData: FormData) {
    setMessage('Procesando...');
    const result = await createRecord(formData);

    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage('Registro exitoso.');
      const form = document.getElementById('record-form') as HTMLFormElement;
      form.reset();
      fetchItems();
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-6">
      <div className="max-w-xl mx-auto py-16">
        <header className="mb-12 border-b border-[#e2e1d5] pb-6 text-center">
          <h1 className="text-xs tracking-[0.3em] uppercase text-[#a3a292] font-bold mb-3">Bitácora de Registro</h1>
          {message && (
            <p className={`mt-2 text-[10px] font-bold uppercase ${message.includes('error') || message.includes('ESPERA') ? 'text-red-400' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </header>

        <form id="record-form" action={handleSubmit} className="relative mb-16">
          {/* Honeypot invisible para bots */}
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          
          <input
            name="content"
            type="text"
            required
            placeholder="Escribe algo..."
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad] transition-all"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] uppercase px-5 py-2 rounded-full font-bold">
            Añadir
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-xs text-[#a3a292] animate-pulse">Sincronizando...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-start border border-transparent hover:border-[#e2e1d5] transition-all">
                <p className="text-sm text-[#5a594e]">{item.content}</p>
                <span className="text-[9px] text-[#a3a292] uppercase ml-4">ID {item.id}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}