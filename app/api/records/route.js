export async function POST(request) {
  try {
    const { content } = await request.json();

    // 1. Consultar si hubo algún envío en el último minuto (en toda la tabla)
    // Esto es drástico: solo permite 1 mensaje por minuto en TOTAL (globalmente)
    const [last] = await pool.query(
      'SELECT created_at FROM records ORDER BY created_at DESC LIMIT 1'
    );

    if (last.length > 0) {
      const lastTime = new Date(last[0].created_at).getTime();
      const now = Date.now();
      if (now - lastTime < 60000) { // 60 segundos
        return NextResponse.json({ error: 'Espera un minuto.' }, { status: 429 });
      }
    }

    // 2. Si pasó el tiempo, insertar
    await pool.query('INSERT INTO records (content) VALUES (?)', [content]);
    return NextResponse.json({ message: 'OK' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}