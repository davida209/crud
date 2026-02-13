'use client';
import { useState, useEffect } from 'react';

export default function Bitacora() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchItems = async () => {
    const res = await fetch('/api/records');
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchItems(); }, []);

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(''); // Limpiar errores previos

    if (!entry.trim()) return;
    
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: entry }),
    });
    
    if (res.status === 429) {
      const data = await res.json();
      setErrorMsg(data.error); // "Espera X segundos"
      return;
    }

    if (res.ok) {
      setEntry('');
      fetchItems();
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-8">
      <div className="max-w-xl mx-auto py-10">
        <header className="mb-10 border-b border-[#e2e1d5] pb-4">
          <h1 className="font-serif italic text-2xl text-[#6b6a5d]">Bitácora Personal</h1>
          {errorMsg && (
            <p className="text-red-400 text-[10px] font-bold uppercase mt-2 animate-bounce">
              {errorMsg}
            </p>
          )}
        </header>

        <form onSubmit={saveEntry} className="mb-10 relative">
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-3 px-6 outline-none focus:border-[#c2c1ad]"
            placeholder="Escribe una entrada..."
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] px-4 py-2 rounded-full uppercase font-bold">
            Añadir
          </button>
        </form>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-4 rounded-xl flex justify-between">
              <p className="text-sm">{item.content}</p>
              <button 
                onClick={async () => {
                  await fetch('/api/records', { 
                    method: 'DELETE', 
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: item.id }) 
                  });
                  fetchItems();
                }}
                className="text-[10px] text-[#c2c1ad] uppercase font-bold hover:text-red-400"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}