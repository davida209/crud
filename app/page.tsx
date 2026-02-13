'use client';

import { useState, useEffect } from 'react';
import { createRecord, updateRecord, deleteRecord } from './actions';

export default function CrudPage() {
  const [items, setItems] = useState<any[]>([]);
  const [entry, setEntry] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar los datos de la API
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error cargando datos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // 2. Manejar el envío del formulario (Crear o Editar)
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Procesando...');
    
    const formData = new FormData(e.currentTarget);

    if (editingId) {
      // MODO EDICIÓN
      const res = await updateRecord(editingId, entry);
      if (res?.error) {
        setMessage(res.error);
      } else {
        setEditingId(null);
        setEntry('');
        setMessage('Registro actualizado correctamente.');
        fetchItems();
      }
    } else {
      // MODO CREACIÓN
      const res = await createRecord(formData);
      if (res?.error) {
        setMessage(res.error);
      } else {
        setEntry('');
        setMessage('Registro añadido con éxito.');
        fetchItems();
      }
    }
  }

  // 3. Preparar la edición
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEntry(item.content);
    setMessage(`Editando registro #${item.id}`);
  };

  // 4. Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setEntry('');
    setMessage('');
  };

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-6 selection:bg-[#e2e1d5]">
      <div className="max-w-xl mx-auto py-12">
        
        <header className="mb-10 border-b border-[#e2e1d5] pb-6 text-center">
          <h1 className="text-[10px] tracking-[0.4em] uppercase text-[#a3a292] font-bold mb-2">
            Proyecto Seguridad
          </h1>
          <h2 className="text-2xl font-serif italic text-[#6b6a5d]">CRUD Formulario</h2>
          {message && (
            <p className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${
              message.includes('error') || message.includes('ESPERA') ? 'text-red-400' : 'text-orange-500'
            }`}>
              {message}
            </p>
          )}
        </header>

        <section className="mb-12">
          <form id="record-form" onSubmit={handleSubmit} className="relative">
            {/* TRAMPA HONEYPOT: Campo invisible para humanos */}
            <input 
              type="text" 
              name="website_url" 
              style={{ display: 'none' }} 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <input
              name="content"
              type="text"
              required
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder={editingId ? "Modificando..." : "Nueva entrada..."}
              className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none focus:border-[#c2c1ad] transition-all shadow-sm"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {editingId && (
                <button 
                  type="button"
                  onClick={cancelEdit}
                  className="bg-[#c2c1ad] text-white text-[9px] uppercase px-4 py-2 rounded-full font-bold hover:bg-[#a3a292]"
                >
                  X
                </button>
              )}
              <button 
                type="submit"
                className="bg-[#6b6a5d] text-white text-[9px] uppercase tracking-widest px-5 py-2 rounded-full hover:bg-[#4a4a44] font-bold transition-colors"
              >
                {editingId ? 'Guardar' : 'Añadir'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {loading ? (
            <p className="text-center text-xs uppercase text-[#a3a292] animate-pulse">Consultando Aiven...</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between items-center border border-transparent hover:border-[#e2e1d5] transition-all shadow-sm">
                <div className="flex-1">
                  <p className="text-sm text-[#5a594e]">{item.content}</p>
                  <p className="text-[8px] text-[#a3a292] mt-1 uppercase">ID: {item.id}</p>
                </div>
                
                <div className="flex gap-4 ml-4">
                  <button 
                    onClick={() => startEdit(item)}
                    className="text-[9px] uppercase font-bold text-blue-500 hover:text-blue-700"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={async () => {
                      if(confirm('¿Borrar registro?')) {
                        await deleteRecord(item.id);
                        fetchItems();
                      }
                    }}
                    className="text-[9px] uppercase font-bold text-red-400 hover:text-red-600"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <footer className="mt-20 text-center">
          <p className="text-[8px] text-[#c2c1ad] uppercase tracking-[0.5em]">
            MySQL Secured &bull; 2026
          </p>
        </footer>

      </div>
    </main>
  );
}