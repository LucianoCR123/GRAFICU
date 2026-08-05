# GRAFICU

Red social de encuestas: la gente vota cosas random, de política, tecnología,
videojuegos y sexualidad, y la plataforma muestra qué opina cada grupo
demográfico (país, género, edad) — todo anónimo, nunca se ve quién votó qué.
Algunas encuestas tienen una "pregunta de control" (ej. "¿de qué lado te
consideras políticamente?" vs "¿qué le dices a tus amigos que eres?") para
medir qué tan honesta es la gente.

## Requisitos

Node.js ya está en `~/.local/node` y en el PATH (`~/.zshrc`) — abre una
terminal nueva o corre `source ~/.zshrc`.

## Cómo correrlo

Backend (API en `http://localhost:4010` — puerto distinto al 4001 de LockIn
para poder correr ambos proyectos a la vez):

```bash
cd server
npm install
cp .env.example .env   # y llena DATABASE_URL con tu connection string de Neon
npm run prisma:migrate # solo la primera vez / cuando cambie el schema
npm run seed           # crea tu cuenta admin + las encuestas de ejemplo
npm run dev
```

Frontend (en `http://localhost:5173`):

```bash
cd client
npm install
npm run dev
```

## Primer uso

- Cualquiera puede navegar y ver resultados sin cuenta.
- Para votar hace falta crear una cuenta (email, contraseña, género, año de
  nacimiento, país — nada más). Desde `/perfil` se puede agregar información
  opcional (ocupación, educación, orientación política, sexualidad, etc.)
  para desbloquear más insights al ver resultados.
- Tu cuenta admin (`lucastanedarjr84@gmail.com`) queda creada por el seed con
  la contraseña que se te dio en el chat al correr `npm run seed` — cámbiala
  desde `/perfil` apenas entres. Como admin ves un link "Admin" en la barra
  de navegación para crear/editar/borrar encuestas en `/admin`.

## Notas técnicas

- Mismo stack y convenciones que LockIn: Express + Prisma + Postgres (Neon),
  auth con JWT en cookie httpOnly, React + Vite en el cliente,
  `client/src/api.js` hecho a mano con `fetch`.
- Anonimato por construcción: ningún endpoint de resultados hace `select` de
  `user.id`/`email` — solo de `gender`/`birthYear`/`country`. Nunca se
  devuelve una lista cruda de votos, solo agregados.
- Una encuesta "pareada" (con pregunta de control) vive en un solo `Poll` con
  `counterQuestion` seteado, reutilizando el mismo set de opciones — un
  `Vote` guarda `optionId` (respuesta principal) y `counterOptionId`
  (respuesta de control). La "tasa de honestidad" es
  `count(optionId === counterOptionId) / count(counterOptionId != null)`.
- Un voto por usuario por encuesta, no se puede cambiar (v1).
- Gráficas con `recharts`, siguiendo el skill de dataviz del proyecto (un
  solo hue de acento, barras finas con extremos redondeados, etiquetas de
  porcentaje directas en vez de leyenda).
