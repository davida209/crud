'use client';
import { useState, useEffect } from 'react';

export default function CRUDPage() {
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
    
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: entry }),
    });
    
    setEntry('');
    fetchItems();
  };

  // ESTA ES LA FUNCIÓN DE ELIMINAR CORREGIDA
  const removeEntry = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este registro?')) return;

    try {
      const res = await fetch(`/api/records?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refrescamos la lista localmente
        fetchItems();
      } else {
        alert('Error al intentar eliminar');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-8">
      <div className="max-w-xl mx-auto">
        <header className="mb-12 border-b border-[#e2e1d5] pb-6 text-center">
          <p className="text-xl italic font-serif text-[#6b6a5d]">Bitácora Personal</p>
        </header>

        <form onSubmit={saveEntry} className="mb-16 relative">
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Escribe algo aquí..."
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad]"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] px-4 py-2 rounded-full uppercase tracking-widest font-bold">
            Añadir
          </button>
        </form>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl border border-[#e2e1d5] flex justify-between items-center group transition-all">
              <p className="text-[#5a594e]">{item.content}</p>
              <button 
                onClick={() => removeEntry(item.id)} 
                className="text-[10px] uppercase font-bold text-[#c2c1ad] hover:text-red-500 transition-colors"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}