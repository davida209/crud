'use client';
import { useState, useEffect } from 'react';
import { createRecord, deleteRecord } from './actions';

export default function ProtectedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchItems = async () => {
    const res = await fetch('/api/records');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  async function handleSubmit(formData: FormData) {
    setMessage('');
    const result = await createRecord(formData);
    
    if (result?.error) {
      setMessage(result.error);
    } else {
      (document.getElementById('entry-form') as HTMLFormElement).reset();
      fetchItems();
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] text-[#4a4a44] p-8">
      <div className="max-w-xl mx-auto">
        <header className="mb-10 border-b border-[#e2e1d5] pb-6">
          <h1 className="font-serif italic text-2xl">Bitácora Protegida</h1>
          {message && <p className="text-red-500 text-xs font-bold mt-2 uppercase">{message}</p>}
        </header>

        {/* Formulario usando Server Actions */}
        <form id="entry-form" action={handleSubmit} className="mb-12 relative">
          <input
            name="content"
            type="text"
            required
            placeholder="Escribe algo..."
            className="w-full bg-[#f1f0e8] border border-[#e2e1d5] rounded-full py-4 px-6 outline-none"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#6b6a5d] text-white text-[10px] px-5 py-2 rounded-full uppercase font-bold">
            Enviar
          </button>
        </form>

        <div className="space-y-4">
          {loading ? <p>Cargando...</p> : items.map((item) => (
            <div key={item.id} className="bg-[#f1f0e8] p-5 rounded-2xl flex justify-between border border-[#e2e1d5]">
              <p>{item.content}</p>
              <button 
                onClick={async () => {
                  await deleteRecord(item.id);
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