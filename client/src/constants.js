// Listas de opciones usadas en registro, perfil y el panel de admin.
// Duplicado a propósito en server/src/utils/constants.js (mismo patrón que
// LockIn: client y server no comparten código).

export const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "politics", label: "Política" },
  { value: "technology", label: "Tecnología" },
  { value: "videogames", label: "Videojuegos" },
  { value: "sexuality", label: "Sexualidad" },
];

export const GENDERS = [
  { value: "mujer", label: "Mujer" },
  { value: "hombre", label: "Hombre" },
  { value: "otro", label: "Otro" },
  { value: "prefiero_no_decir", label: "Prefiero no decir" },
];

export const AGE_BRACKETS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

export const EDUCATION = [
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "tecnico", label: "Técnico" },
  { value: "universitario", label: "Universitario" },
  { value: "posgrado", label: "Posgrado" },
];

export const RELATIONSHIP_STATUS = [
  { value: "soltero", label: "Soltero/a" },
  { value: "en_pareja", label: "En pareja" },
  { value: "casado", label: "Casado/a" },
  { value: "divorciado", label: "Divorciado/a" },
  { value: "otro", label: "Otro" },
];

export const SEXUALITY = [
  { value: "heterosexual", label: "Heterosexual" },
  { value: "homosexual", label: "Homosexual" },
  { value: "bisexual", label: "Bisexual" },
  { value: "otro", label: "Otro" },
  { value: "prefiero_no_decir", label: "Prefiero no decir" },
];

export const POLITICAL_LEANING = [
  { value: "izquierda", label: "Izquierda" },
  { value: "centro", label: "Centro" },
  { value: "derecha", label: "Derecha" },
  { value: "apolitico", label: "Apolítico" },
];

export const RELIGION = [
  { value: "catolico", label: "Católico" },
  { value: "cristiano", label: "Cristiano" },
  { value: "musulman", label: "Musulmán" },
  { value: "judio", label: "Judío" },
  { value: "ateo_agnostico", label: "Ateo/Agnóstico" },
  { value: "otro", label: "Otro" },
];

export const CATEGORY_EMOJI = {
  general: "🎲",
  politics: "🗳️",
  technology: "💻",
  videogames: "🎮",
  sexuality: "🔥",
};

export function labelFor(list, value) {
  return list.find((o) => o.value === value)?.label ?? value;
}

// Nombre humano (en frase, para usar dentro de "agrega X en tu perfil") de
// cada campo opcional de perfil que una encuesta puede exigir para votar.
export const PROFILE_FIELD_PHRASES = {
  occupation: "tu ocupación",
  education: "tu nivel de educación",
  relationshipStatus: "tu estado civil",
  sexuality: "tu sexualidad",
  politicalLeaning: "tu orientación política",
  religion: "tu religión",
};

export const PROFILE_FIELDS = [
  { value: "occupation", label: "Ocupación" },
  { value: "education", label: "Educación" },
  { value: "relationshipStatus", label: "Estado civil" },
  { value: "sexuality", label: "Sexualidad" },
  { value: "politicalLeaning", label: "Orientación política" },
  { value: "religion", label: "Religión" },
];
