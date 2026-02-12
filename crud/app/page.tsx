'use client';
import { useState, useEffect } from 'react';
import { Trash2, PlusCircle, Database } from 'lucide-react';

export default function IDYGS82_SDA2() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  const refresh = async () => {
    const res = await fetch('/api/records');
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => { refresh(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await fetch('/api/records', {
      method: 'POST',
      body: JSON.stringify({ content: input })
    });
    setInput(''); refresh();
  };

  const remove = async (id) => {
    await fetch('/api/records', { method: 'DELETE', body: JSON.stringify({ id }) });
    refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Database className="text-blue-600" size={32} />
          <h1 className="text-3xl font-black text-slate-900">IDYGS82-SDA2</h1>
        </div>

        <form onSubmit={save} className="flex gap-3 mb-10 bg-white p-4 rounded-2xl shadow-sm border">
          <input 
            className="flex-1 p-3 outline-none bg-transparent"
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe algo nuevo para MySQL..." required
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition">
            <PlusCircle size={20} /> Guardar
          </button>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-5">Dato</th>
                <th className="p-5 text-right">Borrar</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/20 transition">
                  <td className="p-5 font-medium">{item.content}</td>
                  <td className="p-5 text-right">
                    <button onClick={() => remove(item.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}