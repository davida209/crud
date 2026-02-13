'use client';
import { useState, useEffect } from 'react';

export default function PaginaBitacora() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
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

  useEffect(() => { fetchItems(); }, []);

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;
    
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: entry }),
    });
    
    if (res.status === 429) {
      alert('Sistema en pausa: Solo se permite un registro por minuto.');
      return;
    }

    setEntry('');
    fetchItems();
  };

  const removeEntry = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return;
    await fetch('/api/records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44]">
      <div className="max-w-xl mx-auto px-8 py-20">
        <header className="mb-12 border-b border-[#e2e1d5] pb-6">
          <h1 className="text-xs tracking-widest uppercase text-[#a3a292] font-semibold mb-2">Control de Flujo</h1>
          <p className="text-xl italic font-serif text-[#6b6a5d]">Frecuencia: 1 entrada por minuto.</p>
        </header>

        <form onSubmit={saveEntry} className="mb-16 relative">
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad]"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-[#f9f8f4] text-[10px] uppercase font-bold px-4 py-2 rounded-full hover:bg-[#4a4a44] transition-all"
          >
            Añadir
          </button>
        </form>

        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-xs text-[#a3a292] animate-pulse">Cargando bitácora...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl border border-transparent hover:border-[#e2e1d5] transition-all flex justify-between items-start">
                <div>
                  <p className="text-[#5a594e]">{item.content}</p>
                  <span className="text-[9px] uppercase text-[#a3a292] mt-2 block tracking-widest">ID: {item.id}</span>
                </div>
                <button 
                  onClick={() => removeEntry(item.id)} 
                  className="text-[9px] font-bold text-[#c2c1ad] hover:text-red-400 uppercase transition-colors"
                >
                  Borrar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}