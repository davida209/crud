'use client';
import { useState, useEffect } from 'react';

export default function PaginaBitacora() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [canPost, setCanPost] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  // Lógica del temporizador
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanPost(true);
    }
  }, [secondsLeft]);

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim() || !canPost) return;
    
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: entry }),
    });
    
    if (res.status === 201) {
      setEntry('');
      setCanPost(false);
      setSecondsLeft(60); // Bloqueo de 60 segundos
      fetchItems();
    } else if (res.status === 429) {
      alert('Demasiado rápido. Espera un poco.');
    }
  };

  const removeEntry = async (id: number) => {
    if (!confirm('¿Eliminar?')) return;
    await fetch('/api/records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-8">
      <div className="max-w-xl mx-auto py-20">
        <header className="mb-12 border-b border-[#e2e1d5] pb-6">
          <p className="text-xl italic font-serif text-[#6b6a5d]">Bitácora Protegida</p>
          {!canPost && (
            <p className="text-[10px] text-orange-400 uppercase font-bold mt-2">
              Modo espera: Podrás publicar en {secondsLeft} segundos
            </p>
          )}
        </header>

        <form onSubmit={saveEntry} className="mb-16 relative">
          <input
            type="text"
            value={entry}
            disabled={!canPost}
            onChange={(e) => setEntry(e.target.value)}
            placeholder={canPost ? "Escribe aquí..." : "Espera un minuto..."}
            className={`w-full border rounded-full py-4 px-6 outline-none transition-all ${
              canPost ? 'bg-[#f1f0e8] border-[#e2e1d5]' : 'bg-zinc-100 border-transparent text-zinc-400'
            }`}
          />
          <button 
            type="submit"
            disabled={!canPost}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold px-4 py-2 rounded-full transition-all ${
              canPost ? 'bg-[#6b6a5d] text-white' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {canPost ? 'Añadir' : `${secondsLeft}s`}
          </button>
        </form>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-start border border-transparent hover:border-[#e2e1d5]">
              <p>{item.content}</p>
              <button onClick={() => removeEntry(item.id)} className="text-[10px] text-[#c2c1ad] hover:text-red-400">Quitar</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}