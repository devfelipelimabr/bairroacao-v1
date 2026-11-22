import { mkdirSync } from "fs";
import { dirname } from "path";
import { getDb } from "../api/queries/connection";
import { neighborhoods, posts } from "./schema";

async function seed() {
  const db = await getDb();
  console.log("Seeding database...");

  // Seed neighborhoods
  const hoods = await db.insert(neighborhoods).values([
    { name: "Vila Aurora", city: "São Paulo", state: "SP", active: true, minUsers: 30, usersCount: 47 },
    { name: "Vila Matilde", city: "São Paulo", state: "SP", active: false, minUsers: 30, usersCount: 14 },
  ]).returning({ id: neighborhoods.id });

  const vilaAuroraId = hoods[0].id;

  // Seed posts
  await db.insert(posts).values([
    {
      type: "issue", category: "Asfalto/Buraco",
      title: "Buraco profundo na Rua das Amoras, 120",
      description: "Afundamento com mais de 40cm próximo ao meio-fio. Dois carros já bateram na semana passada.",
      status: "Aberto", confirms: 12, comments: 5, dist: 350, x: 128, y: 150,
      authorId: 1, neighborhoodId: vilaAuroraId, coords: "-23.5512, -46.6890",
    },
    {
      type: "issue", category: "Iluminação",
      title: "Poste apagado há 3 semanas na Praça do Coreto",
      description: "Trecho entre a praça e a Rua Cláudia ficou completamente às escuras.",
      status: "Confirmado", confirms: 27, comments: 9, dist: 600, x: 210, y: 96,
      authorId: 2, neighborhoodId: vilaAuroraId, coords: "-23.5498, -46.6862",
    },
    {
      type: "issue", category: "Lixo/Entulho",
      title: "Entulho acumulado no terreno baldio da Rua Ipê",
      description: "Caminhão descarrega entulho todo fim de semana. Risco de foco de dengue.",
      status: "Em andamento", confirms: 31, comments: 12, dist: 900, x: 262, y: 238,
      authorId: 3, neighborhoodId: vilaAuroraId, coords: "-23.5531, -46.6915",
    },
    {
      type: "issue", category: "Água/Esgoto",
      title: "Vazamento na calçada da Rua Cláudia, 45",
      description: "Água limpa jorra há 5 dias. Calçada afundando.",
      status: "Aberto", confirms: 8, comments: 3, dist: 500, x: 176, y: 196,
      authorId: 4, neighborhoodId: vilaAuroraId, coords: "-23.5504, -46.6888",
    },
    {
      type: "issue", category: "Poda/Árvores",
      title: "Galhos obstruindo faixa de pedestres",
      description: "Árvore na Rua das Hortênsias invadindo a calçada. Cadeirantes precisam descer para a rua.",
      status: "Resolvido", confirms: 19, comments: 4, dist: 750, x: 88, y: 256,
      authorId: 5, neighborhoodId: vilaAuroraId, coords: "-23.5520, -46.6927", proof: true,
    },
    {
      type: "alert", category: "Rua interditada",
      title: "Rua interditada para obras — desvio pela Rua B",
      description: "Interdição total da Rua das Amoras até sexta. Desvio sinalizado.",
      status: "Aberto", confirms: 34, comments: 6, dist: 400, x: 150, y: 172,
      authorId: 6, neighborhoodId: vilaAuroraId, coords: "-23.5500, -46.6890",
      valid: "expira em 18h", blur: true,
    },
    {
      type: "alert", category: "Pet perdido",
      title: "Cachorro perdido — golden, coleira azul",
      description: "Responde pelo nome Thor. Localização exata ofuscada em 200m.",
      status: "Aberto", confirms: 22, comments: 11, dist: 650, x: 226, y: 118,
      authorId: 7, neighborhoodId: vilaAuroraId, coords: "-23.5495, -46.6870",
      valid: "expira em 42h", blur: true,
    },
    {
      type: "service", category: "Eletricista",
      title: "Marco — eletricista (indicação da vizinhança)",
      description: "Resolveu o quadro do prédio em 1h, preço justo, atende no bairro há 12 anos.",
      status: "Aberto", confirms: 41, comments: 7, dist: 200, x: 132, y: 206,
      authorId: 8, neighborhoodId: vilaAuroraId, coords: "-23.5515, -46.6900",
      rating: "4,9 (41 avaliações)",
    },
    {
      type: "proposal", category: "Melhoria",
      title: "Academia ao ar livre na Praça do Coreto",
      description: "Instalar aparelhos de ginástica na área gramada leste, via emenda parlamentar.",
      status: "Aberto", confirms: 0, comments: 14, dist: 600, x: 206, y: 84,
      authorId: 9, neighborhoodId: vilaAuroraId, coords: "-23.5490, -46.6865",
      apoio: 23, contra: 4, quorum: 30, deadline: "encerra em 2 dias",
    },
  ]);

  console.log("Done.");
  process.exit(0);
}

// Ensure data directory exists
try {
  mkdirSync("./data", { recursive: true });
} catch {
  // already exists
}

seed();
