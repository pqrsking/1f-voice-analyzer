/**
 * Constellation Identity System — completely client-side, never transmitted raw.
 *
 * The identity string (e.g. "OrionDreamer-7742") lives only in localStorage.
 * What we send to the server is SHA-256(identity), making it one-way irreversible.
 */

const STORAGE_KEY = "sprout_constellation_v1";

const CONSTELLATIONS = [
  "Orion","Lyra","Cygnus","Vega","Andromeda","Perseus","Cassiopeia","Gemini",
  "Leo","Virgo","Scorpius","Aquarius","Pisces","Aries","Taurus","Capricorn",
  "Sagittarius","Libra","Cancer","Phoenix","Aquila","Corona","Centaurus","Crux",
  "Draco","Eridanus","Fornax","Hercules","Hydra","Indus","Lacerta","Lupus",
  "Lynx","Mensa","Microscopium","Monoceros","Musca","Norma","Octans","Ophiuchus",
  "Pavo","Pegasus","Pictor","Puppis","Pyxis","Reticulum","Sculptor","Serpens",
  "Triangulum","Tucana",
];

const ARCHETYPES = [
  "Dreamer","Builder","Finder","Keeper","Weaver","Dancer","Seeker","Maker",
  "Shaper","Keeper","Glider","Flyer","Swimmer","Runner","Climber","Diver",
  "Wanderer","Explorer","Pioneer","Voyager",
];

async function sha256hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateIdentity(): Promise<string> {
  const entropy = [
    navigator.userAgent.slice(0, 20),
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(Date.now()),
    String(Math.random() * 1e15),
  ].join("|");

  const hex = await sha256hex(entropy);
  const bytes = hex.match(/.{2}/g)!.map((b) => parseInt(b, 16));

  const constellationIdx = ((bytes[0] << 8) | bytes[1]) % CONSTELLATIONS.length;
  const archetypeIdx = ((bytes[2] << 8) | bytes[3]) % ARCHETYPES.length;
  const number = (((bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7]) >>> 0) % 9000 + 1000;

  return `${CONSTELLATIONS[constellationIdx]}${ARCHETYPES[archetypeIdx]}-${number}`;
}

export async function getOrCreateIdentity(): Promise<string> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const identity = await generateIdentity();
  localStorage.setItem(STORAGE_KEY, identity);
  return identity;
}

export async function getConstellationToken(): Promise<string> {
  const identity = await getOrCreateIdentity();
  return sha256hex(identity);
}

export function getStoredIdentity(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
