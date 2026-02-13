'use client';
import { useState, useEffect } from 'react';

export default function ProtectedCRUD() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry.trim()) return;
    setStatusMsg({ text: '', type: '' });

    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: entry }),
    });

    const data = await res.json();

    if (res.status === 429) {
      setStatusMsg({ text: data.error, type: 'error' });
      return;
    }

    if (res.ok) {
      setEntry('');
      setStatusMsg({ text: 'Nota guardada con éxito.', type: 'success' });
      fetchItems();
    }
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-8">
      <div className="max-w-xl mx-auto py-10">
        <header className="mb-10 border-b border-[#e2e1d5] pb-6">
          <h1 className="font-serif italic text-2xl text-[#6b6a5d]">Bitácora Segura</h1>
          {statusMsg.text && (
            <p className={`text-[10px] font-bold uppercase mt-4 p-2 rounded ${
              statusMsg.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'
            }`}>
              {statusMsg.text}
            </p>
          )}
        </header>

        <form onSubmit={saveEntry} className="mb-16 relative">
          <input
            type="text"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad] transition-all"
            placeholder="¿Qué quieres registrar hoy?"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] px-5 py-2 rounded-full uppercase font-bold hover:bg-[#4a4a44] transition-colors">
            Añadir
          </button>
        </form>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-xs text-[#a3a292] animate-pulse">Sincronizando con Aiven...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-start border border-transparent hover:border-[#e2e1d5] transition-all">
                <p className="text-[#5a594e] text-sm">{item.content}</p>
                <button 
                  onClick={async () => {
                    await fetch('/api/records', { 
                      method: 'DELETE', 
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ id: item.id }) 
                    });
                    fetchItems();
                  }}
                  className="text-[9px] text-[#c2c1ad] uppercase font-bold hover:text-red-400 ml-4"
                >
                  Quitar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}