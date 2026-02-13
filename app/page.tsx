'use client';
import { useState } from 'react';
import { createRecord } from './actions';

export default function SecurityPage() {
  const [msg, setMsg] = useState('');

  async function clientAction(formData: FormData) {
    setMsg('Enviando...');
    const res = await createRecord(formData);
    if (res?.error) setMsg(res.error);
    else {
      setMsg('¡Guardado!');
      (document.getElementById('secure-form') as HTMLFormElement).reset();
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f8f4] p-10">
      <div className="max-w-md mx-auto">
        <form id="secure-form" action={clientAction} className="space-y-4">
          
          {/* HONEYPOT: Invisible para humanos */}
          <input type="text" name="website_url" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          
          {/* TOKEN DINÁMICO: Cambia cada vez que se carga la página */}
          <input type="hidden" name="auth_token" value={Date.now()} />

          <input 
            name="content" 
            className="w-full p-4 rounded-xl border border-[#e2e1d5] bg-[#f1f0e8] outline-none" 
            placeholder="Escribe algo seguro..."
          />
          
          <button type="submit" className="w-full bg-[#6b6a5d] text-white p-3 rounded-xl font-bold uppercase text-xs">
            Añadir Registro
          </button>
        </form>
        {msg && <p className="mt-4 text-center text-xs font-mono uppercase">{msg}</p>}
      </div>
    </main>
  );
}