// Duplicado a proposito de client/src/constants.js (mismo patron que
// LockIn: client y server no comparten codigo). Usado para validar inputs.

export const CATEGORIES = ["general", "politics", "technology", "videogames", "sexuality", "entertainment"];

export const GENDERS = ["mujer", "hombre", "otro", "prefiero_no_decir"];

export const EDUCATION = ["primaria", "secundaria", "tecnico", "universitario", "posgrado"];

export const RELATIONSHIP_STATUS = ["soltero", "en_pareja", "casado", "divorciado", "otro"];

export const SEXUALITY = ["heterosexual", "homosexual", "bisexual", "otro", "prefiero_no_decir"];

export const POLITICAL_LEANING = ["izquierda", "centro", "derecha", "apolitico"];

export const RELIGION = ["catolico", "cristiano", "musulman", "judio", "ateo_agnostico", "otro"];

// Nombres de los campos opcionales de perfil que una encuesta puede exigir
// para poder votar (Poll.requiredProfileField).
export const PROFILE_FIELDS = [
  "occupation",
  "education",
  "relationshipStatus",
  "sexuality",
  "politicalLeaning",
  "religion",
];
