import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const POLLS = [
  {
    category: "general",
    question: "¿Quién es más fuerte, los hombres o las mujeres?",
    options: ["Los hombres", "Las mujeres", "Es igual", "Depende de la persona"],
  },
  {
    category: "general",
    question: "¿Perro o gato?",
    options: ["Perro", "Gato", "Ambos", "Ninguno"],
  },
  {
    category: "politics",
    question: "¿Te consideras de izquierda o de derecha?",
    counterQuestion: "¿Qué le dices a tus amigos que eres, políticamente?",
    options: ["Izquierda", "Centro", "Derecha", "Apolítico"],
  },
  {
    category: "politics",
    question: "¿Debería ser obligatorio votar en las elecciones?",
    options: ["Sí, obligatorio", "No, debería ser voluntario", "No sé"],
  },
  {
    category: "technology",
    question: "¿Cuál asistente de inteligencia artificial usas más?",
    options: ["ChatGPT", "Claude", "Gemini", "Otro", "Ninguno"],
  },
  {
    category: "technology",
    question: "¿iPhone o Android?",
    options: ["iPhone", "Android", "Me da igual"],
  },
  {
    category: "videogames",
    question: "¿Cuál es la mejor consola de todos los tiempos?",
    options: ["PlayStation", "Xbox", "Nintendo", "PC"],
  },
  {
    category: "videogames",
    question: "¿Los videojuegos deberían considerarse un deporte (e-sports)?",
    options: ["Sí, totalmente", "No, no es lo mismo", "Depende del juego"],
  },
  {
    category: "sexuality",
    question: "¿Los hombres piensan en sexo más que las mujeres?",
    options: ["Sí, mucho más", "Sí, un poco más", "No, es igual", "No, las mujeres piensan más"],
  },
  {
    category: "sexuality",
    question: "¿Alguna vez has fingido un orgasmo?",
    counterQuestion: "¿Se lo dirías a tu pareja si lo hicieras (o lo hiciste)?",
    options: ["Sí", "No"],
  },
];

async function main() {
  const adminEmail = "lucastanedarjr84@gmail.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "graficu-admin-2026";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { isAdmin: true },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      isAdmin: true,
      gender: "hombre",
      birthYear: 1990,
      country: "CO",
    },
  });
  console.log(`Admin listo: ${adminEmail} (cambia la password desde /perfil)`);

  for (const pollData of POLLS) {
    const existing = await prisma.poll.findFirst({ where: { question: pollData.question } });
    if (existing) {
      console.log(`Ya existe, se omite: "${pollData.question}"`);
      continue;
    }
    await prisma.$transaction(async (tx) => {
      const poll = await tx.poll.create({
        data: {
          category: pollData.category,
          question: pollData.question,
          counterQuestion: pollData.counterQuestion || null,
        },
      });
      await tx.pollOption.createMany({
        data: pollData.options.map((label, index) => ({ pollId: poll.id, label, sortOrder: index })),
      });
    });
    console.log(`Creada: "${pollData.question}"`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
