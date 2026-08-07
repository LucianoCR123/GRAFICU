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
  {
    category: "technology",
    question: "¿La inteligencia artificial le va a quitar el trabajo a la gente de tu profesión?",
    requiredProfileField: "occupation",
    options: ["Sí, ya está pasando", "Sí, en unos años", "No, mi trabajo es seguro", "No sé"],
  },
  {
    category: "politics",
    question: "¿Estás a favor de la pena de muerte?",
    counterQuestion: "¿Lo dirías en público frente a desconocidos?",
    options: ["Sí", "No", "Depende del crimen"],
  },
  {
    category: "general",
    question: "¿Cuál es el mejor día de la semana?",
    options: ["Viernes", "Sábado", "Domingo", "Lunes", "Otro"],
  },
  {
    category: "sexuality",
    question: "¿A qué edad perdiste la virginidad?",
    options: ["Antes de los 15", "15-17", "18-21", "Después de los 21", "Aún no"],
  },
  {
    category: "sexuality",
    question: "¿Le has sido infiel a tu pareja?",
    counterQuestion: "¿Se lo confesarías si te preguntara directamente?",
    requiredProfileField: "relationshipStatus",
    options: ["Sí", "No"],
  },
  {
    category: "technology",
    question: "¿Cuál red social usas más?",
    options: ["Instagram", "TikTok", "X", "Facebook", "Otra"],
  },
  {
    category: "videogames",
    question: "¿Los videojuegos violentos vuelven violenta a la gente?",
    options: ["Sí", "No", "Depende de la persona"],
  },
  {
    category: "general",
    question: "¿Crees que la universidad vale la pena?",
    requiredProfileField: "education",
    options: ["Sí, totalmente", "Depende de la carrera", "No, es una pérdida de tiempo/dinero"],
  },
  {
    category: "politics",
    question: "¿El gobierno de tu país está haciendo un buen trabajo?",
    options: ["Sí", "No", "Más o menos"],
  },
  {
    category: "sexuality",
    question: "¿Ves pornografía regularmente?",
    counterQuestion: "¿Lo admitirías si tu pareja te preguntara?",
    options: ["Sí", "No"],
  },
  // --- Caso: "empresario" (ver CASES abajo) ---
  {
    category: "general",
    caseKey: "empresario",
    question: "¿Consideras que esto fue abuso de poder, aunque ella haya accedido en su momento?",
    options: ["Sí", "No", "Depende de las circunstancias"],
  },
  {
    category: "general",
    caseKey: "empresario",
    question: "¿Debería haber consecuencias legales para él, a pesar de que ella dijo que sí en su momento?",
    options: ["Sí, debería ser penalizado", "No, fue consensuado", "Depende de la diferencia de poder"],
  },
  {
    category: "general",
    caseKey: "empresario",
    question: "¿El miedo a perder el trabajo invalida un consentimiento dado explícitamente?",
    options: ["Sí, lo invalida", "No, un sí es un sí", "Depende del caso"],
  },
  // --- Entretenimiento ---
  {
    category: "entertainment",
    question: "¿Cuál es tu serie favorita de Netflix?",
    options: ["Stranger Things", "La Casa de Papel", "Wednesday", "Black Mirror", "Otra"],
  },
  {
    category: "entertainment",
    question: "¿Cuál plataforma de streaming usas más?",
    options: ["Netflix", "HBO Max", "Disney+", "Amazon Prime", "Otra"],
  },
  {
    category: "entertainment",
    question: "¿Deberían cancelar más series después de una temporada mala?",
    options: ["Sí", "No", "Depende"],
  },
  {
    category: "entertainment",
    question: "¿Qué es mejor: el libro o la adaptación en serie/película?",
    options: ["El libro siempre", "La adaptación puede ser mejor", "Depende"],
  },
  {
    category: "entertainment",
    question: "¿Cuál es la mejor película de superhéroes de todos los tiempos?",
    options: ["Marvel", "DC", "Otra", "No me gustan"],
  },
  {
    category: "entertainment",
    question: "¿Los spoilers son de mal gusto sin importar cuánto tiempo haya pasado?",
    options: ["Sí, siempre", "No, después de un tiempo ya no aplica", "Depende del caso"],
  },
  {
    category: "entertainment",
    question: "¿Cuál reality show es el más adictivo?",
    options: ["La Isla de las Tentaciones", "Love Island", "Gran Hermano", "No veo realities"],
  },
];

const CASES = {
  empresario: {
    title: "El empresario y la empleada: ¿abuso de poder o consentimiento?",
    body: [
      "Este es un caso compuesto (no corresponde a una persona o empresa real específica), pensado para explorar cómo piensa la gente sobre el consentimiento y las relaciones de poder.",
      "Un empresario con una posición de autoridad significativa dentro de su compañía comienza a coquetear con una empleada. Ella accede: sale con él, va a su casa, y participa de manera consensuada en lo que ocurre entre ellos, sin objetar en ningún momento.",
      "Años después, ella declara públicamente que lo ocurrido fue abuso. Explica que, aunque nunca dijo que no, su consentimiento estuvo condicionado por el miedo a perder su trabajo si se negaba. Él sostiene que todo fue consensuado y que nunca la presionó explícitamente.",
      "¿Tú qué opinas?",
    ].join("\n\n"),
    sourceLinks: null,
  },
};

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

  const caseIdByKey = {};
  for (const [key, caseData] of Object.entries(CASES)) {
    const existing = await prisma.case.findFirst({ where: { title: caseData.title } });
    if (existing) {
      console.log(`Caso ya existe, se omite: "${caseData.title}"`);
      caseIdByKey[key] = existing.id;
      continue;
    }
    const created = await prisma.case.create({ data: caseData });
    caseIdByKey[key] = created.id;
    console.log(`Caso creado: "${caseData.title}"`);
  }

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
          requiredProfileField: pollData.requiredProfileField || null,
          caseId: pollData.caseKey ? caseIdByKey[pollData.caseKey] : null,
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
