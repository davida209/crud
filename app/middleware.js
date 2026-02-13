import { NextResponse } from 'next/server';

// Memoria temporal para guardar las IPs (se reinicia si Vercel apaga la función)
const trackers = new Map();

export function middleware(request) {
  // Solo aplicamos el límite a las rutas de la API
  if (request.nextUrl.pathname.startsWith('/api/records')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 10; // Máximo 10 peticiones por minuto

    if (!trackers.has(ip)) {
      trackers.set(ip, { count: 1, startTime: now });
    } else {
      const tracker = trackers.get(ip);
      
      // Si ya pasó el minuto, reiniciamos el contador
      if (now - tracker.startTime > windowMs) {
        tracker.count = 1;
        tracker.startTime = now;
      } else {
        // Si sigue dentro del minuto, aumentamos el contador
        tracker.count++;
      }

      // Si excede el límite, bloqueamos
      if (tracker.count > maxRequests) {
        return new NextResponse(
          JSON.stringify({ error: 'Demasiadas peticiones. Intenta de nuevo en un minuto.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  return NextResponse.next();
}

// Configuración para que el middleware solo corra en la API
export const config = {
  matcher: '/api/:path*',
};