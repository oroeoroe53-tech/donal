// Guion del vídeo. Cada entrada es un bloque; la duración va en segundos.
export type Seg =
  | { k: "opening"; id: string; dur: number }
  | { k: "chapter"; id: string; num: string; title: string; sub: string; dur: number }
  | { k: "hero"; id: string; kicker: string; title: string; text?: string; dur: number }
  | { k: "photo"; id: string; kicker?: string; title: string; dur: number }
  | { k: "tri"; ids: string[]; title: string; dur: number }
  | { k: "pillars"; dur: number }
  | { k: "diocese"; id: string; dur: number }
  | { k: "ventajas"; id: string; dur: number }
  | { k: "formas"; id: string; dur: number }
  | { k: "quote"; id: string; dur: number }
  | { k: "costs"; id: string; dur: number }
  | { k: "tax"; id: string; dur: number }
  | { k: "howto"; id: string; dur: number }
  | { k: "info"; id: string; dur: number }
  | { k: "closing"; id: string; loopId: string; dur: number }
  | { k: "credits"; dur: number };

const H = 6; // protagonista
const P = 3.5; // normal
const T = 3.6; // tríptico (mosaico)
const CH = 4.5; // portada de capítulo

export const TIMELINE: Seg[] = [
  // 1 · APERTURA
  { k: "opening", id: "069", dur: 8 },
  { k: "photo", id: "024", kicker: "Medina del Campo", title: "Nuestra casa, abierta a todos", dur: P + 0.5 },
  { k: "tri", ids: ["078", "085", "068"], title: "Santiago el Real", dur: T },

  // 2 · NUESTRO TEMPLO
  { k: "chapter", id: "077", num: "01", title: "Nuestro templo", sub: "Antigua iglesia del noviciado jesuita · Bien de Interés Cultural desde 1968", dur: CH + 1 },
  { k: "hero", id: "092", kicker: "Patrimonio", title: "Santiago Apóstol nos acoge", text: "Retablos, imágenes y siglos de historia que cuidamos entre todos.", dur: H },
  { k: "photo", id: "003", kicker: "Patrimonio", title: "Un templo que se explica y se comparte", dur: P },
  { k: "photo", id: "070", kicker: "Patrimonio", title: "Belleza al servicio de la fe", dur: P },
  { k: "photo", id: "013", kicker: "Jóvenes", title: "Ante el retablo mayor", dur: P },
  { k: "photo", id: "035", kicker: "Cultura", title: "Visitas guiadas", dur: P },
  { k: "tri", ids: ["019", "022", "023"], title: "Abierto a escolares y visitantes", dur: T },
  { k: "tri", ids: ["027", "028", "033"], title: "Un patrimonio que nos une", dur: T },
  { k: "tri", ids: ["039", "040", "084"], title: "Historia viva de Medina", dur: T },
  { k: "tri", ids: ["073", "062"], title: "Jesús atado a la columna", dur: T },

  // 3 · LA VIDA DE CADA DÍA
  { k: "chapter", id: "048", num: "02", title: "La vida de cada día", sub: "Eucaristía, sacramentos y acompañamiento", dur: CH },
  { k: "hero", id: "031", kicker: "Cerca de los que sufren", title: "Llevamos la comunión a los enfermos", dur: H },
  { k: "hero", id: "082", kicker: "Viernes · 18:00 h", title: "Hora Santa y confesiones", dur: H },
  { k: "photo", id: "002", kicker: "Eucaristía", title: "Proclamamos la Palabra", dur: P },
  { k: "photo", id: "096", kicker: "Matrimonio", title: "Celebramos el amor", dur: P },
  { k: "photo", id: "058", kicker: "Sacramentos", title: "Acompañamos cada etapa de la vida", dur: P },
  { k: "photo", id: "032", kicker: "Bautismo", title: "Nuevos miembros de la comunidad", dur: P },
  { k: "tri", ids: ["011", "054", "036"], title: "Bodas y bautizos", dur: T },
  { k: "tri", ids: ["037", "045", "060"], title: "Familias que crecen en la fe", dur: T },
  { k: "tri", ids: ["061", "064"], title: "Cada bautizo, una fiesta", dur: T },
  { k: "tri", ids: ["081", "008"], title: "Comuniones y celebraciones", dur: T },

  // 4 · UN LUGAR PARA REZAR
  { k: "chapter", id: "059", num: "03", title: "Un lugar para rezar", sub: "Adoración, vigilias y silencio", dur: CH },
  { k: "hero", id: "056", kicker: "Adoración", title: "Él nos espera", dur: H },
  { k: "hero", id: "041", kicker: "Cuaresma y Semana Santa", title: "Contemplar su entrega", dur: H },
  { k: "photo", id: "083", kicker: "Jueves Santo", title: "Velar junto al Señor", dur: P },
  { k: "photo", id: "094", kicker: "Miércoles de Ceniza", title: "Comenzamos la Cuaresma", dur: P },
  { k: "photo", id: "065", kicker: "Familias", title: "La fe que se transmite", dur: P },
  { k: "photo", id: "066", kicker: "Jóvenes", title: "Jóvenes que rezan", dur: P },
  { k: "tri", ids: ["009", "004", "006"], title: "Miércoles de Ceniza", dur: T },
  { k: "tri", ids: ["010", "053", "067"], title: "Vigilias y oración", dur: T },
  { k: "tri", ids: ["051", "052", "086"], title: "Momentos de encuentro", dur: T },
  { k: "tri", ids: ["026", "030"], title: "Adviento", dur: T },

  // 5 · COMUNIDAD VIVA
  { k: "chapter", id: "079", num: "04", title: "Una comunidad viva", sub: "Música, cultura, jóvenes y cofradía", dur: CH },
  { k: "hero", id: "005", kicker: "Música", title: "Conciertos en el templo", dur: H },
  { k: "photo", id: "034", kicker: "Música", title: "Coro parroquial", dur: P },
  { k: "photo", id: "099", kicker: "Encuentros", title: "Oración y reflexión en el templo", dur: P },
  { k: "photo", id: "043", kicker: "Convivencia", title: "Compartir la mesa", dur: P },
  { k: "photo", id: "046", kicker: "Formación", title: "Encuentros y charlas", dur: P },
  { k: "tri", ids: ["047", "093", "097"], title: "Cultura y música", dur: T },
  { k: "tri", ids: ["017", "089", "029"], title: "Amistad y comunidad", dur: T },
  { k: "tri", ids: ["001", "007"], title: "Con nuestro obispo", dur: T },
  { k: "tri", ids: ["018", "025", "055"], title: "Celebramos juntos", dur: T },
  { k: "tri", ids: ["021", "042", "057"], title: "Nuestra cofradía", dur: T },
  { k: "tri", ids: ["050", "072", "074"], title: "Semana Santa", dur: T },
  { k: "tri", ids: ["080", "088"], title: "Nuestra banda", dur: T },
  { k: "tri", ids: ["098", "091"], title: "Siempre en camino", dur: T },

  // 6 · MANOS QUE SIRVEN
  { k: "chapter", id: "076", num: "05", title: "Manos que sirven", sub: "Voluntariado y Cáritas parroquial", dur: CH },
  { k: "hero", id: "016", kicker: "Voluntariado", title: "Tiempo regalado para cuidar la casa de todos", dur: H },
  { k: "photo", id: "014", kicker: "Voluntariado", title: "Cuidamos el templo", dur: P },
  { k: "photo", id: "071", kicker: "Cáritas", title: "La parroquia sale a la calle", dur: P },
  { k: "photo", id: "087", kicker: "Detalles", title: "Pequeños gestos que acompañan", dur: P },
  { k: "tri", ids: ["015", "038", "075"], title: "Cada mano cuenta", dur: T },

  // 7 · PILARES
  { k: "pillars", dur: 12 },

  // 8 · CAMPAÑA
  { k: "diocese", id: "059", dur: 9 },
  { k: "ventajas", id: "077", dur: 14 },
  { k: "costs", id: "077", dur: 13 },
  { k: "tax", id: "058", dur: 12 },
  { k: "howto", id: "095", dur: 16 },
  { k: "info", id: "092", dur: 16 },

  // 9 · CIERRE → enlaza con la apertura
  { k: "closing", id: "056", loopId: "069", dur: 7 },
  { k: "credits", dur: 5 },
];

export const TRANSITION = 0.6; // segundos de fundido entre bloques
