'use client';
import { useState } from 'react';
import { createRecord } from './actions';

export default function SecurityPage() {
  const [msg, setMsg] = useState('');

  async function clientAction(formData: FormData) {
    setMsg('Procesando...');
    const res = await createRecord(formData);
    if (res?.error) {
      setMsg(res.error);
    } else {
      setMsg('Registro exitoso.');
      (document.getElementById('secure-form') as HTMLFormElement).reset();
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] p-10 font-sans">
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-[#e2e1d5]">
        <form id="secure-form" action={clientAction} className="space-y-6">
          
          {/* HONEYPOT: Invisible para humanos, trampa para bots */}
          <input type="text" name="hp_field" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          
          {/* TOKEN DINÁMICO: Se invalida después de 2 minutos */}
          <input type="hidden" name="auth_ts" value={Date.now()} />

          <div className="relative">
            <input 
              name="content" 
              required
              placeholder="Escribir nota..." 
              className="w-full p-4 pr-24 rounded-2xl bg-[#f1f0e8] border-none outline-none focus:ring-2 focus:ring-[#6b6a5d] transition-all"
            />
            <button type="submit" className="absolute right-2 top-2 bg-[#6b6a5d] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-[#4a4a44]">
              Añadir
            </button>
          </div>
        </form>
        {msg && <p className="mt-4 text-center text-[10px] uppercase tracking-widest font-bold text-[#a3a292]">{msg}</p>}
      </div>
    </main>
  );
}