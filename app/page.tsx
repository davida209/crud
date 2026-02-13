'use client';
import { useState, useEffect } from 'react';

export default function OrganicPage() {
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

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] selection:bg-[#e2e1d5]">
      <div className="max-w-xl mx-auto px-8 py-20">
        
        {/* Header con tono suave */}
        <header className="mb-12 border-b border-[#e2e1d5] pb-6">
          <h1 className="text-xs tracking-[0.2em] uppercase text-[#a3a292] font-semibold mb-3">
            Bitácora de Registro
          </h1>
          <p className="text-xl italic font-serif text-[#6b6a5d]">
            Almacenamiento de notas y datos persistentes.
          </p>
        </header>

        {/* Input con fondo crema oscuro */}
        <section className="mb-16">
          <form onSubmit={saveEntry} className="relative">
            <input
              type="text"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Escribe algo aquí..."
              className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad] transition-all placeholder:text-[#c2c1ad] text-[#4a4a44]"
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-[#f9f8f4] text-[10px] uppercase tracking-widest px-4 py-2 rounded-full hover:bg-[#4a4a44] transition-colors"
            >
              Añadir
            </button>
          </form>
        </section>

        {/* Listado de elementos */}
        <section className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="text-xs uppercase tracking-widest text-[#a3a292] animate-pulse">Cargando datos</span>
            </div>
          ) : (
            <>
              {items.length > 0 ? (
                items.map((item) => (
                  <div 
                    key={item.id} 
                    className="group bg-[#f1f0e8] p-5 rounded-2xl border border-transparent hover:border-[#e2e1d5] transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-[15px] leading-relaxed text-[#5a594e]">
                        {item.content}
                      </p>
                      <button 
                        className="text-[9px] uppercase font-bold text-[#c2c1ad] hover:text-[#a34444] ml-4 pt-1 transition-colors"
                        onClick={() => {/* Lógica borrar */}}
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-[1px] w-4 bg-[#e2e1d5]"></span>
                      <span className="text-[9px] uppercase tracking-tighter text-[#a3a292]">
                        Ref. {item.id}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-[#e2e1d5] rounded-3xl">
                  <p className="text-[#c2c1ad] font-serif italic">La bitácora está vacía.</p>
                </div>
              )}
            </>
          )}
        </section>

        <footer className="mt-24 text-center">
          <span className="text-[9px] text-[#c2c1ad] uppercase tracking-[0.3em]">
            Base de Datos MySQL &bull;
          </span>
        </footer>
      </div>
    </main>
  );
}