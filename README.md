# BairroAção v1

Rede social cívica hiperlocal com login OAuth Kimi.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: tRPC + Drizzle ORM + Hono + MySQL
- **Auth**: Kimi OAuth 2.0 (Sign in with Kimi)

## Funcionalidades

- Feed geolocalizado com 4 tipos de postagem (problema, proposta, alerta, indicação)
- Confirmação coletiva de problemas urbanos
- Votação de propostas com quórum
- Dossiê cívico PDF
- Reputação cívica
- Modo observador
- Privacidade por design

## Scripts

```bash
npm run dev      # desenvolvimento
npm run build    # produção
npm run check    # type-check
npm run db:push  # sincronizar schema
```
