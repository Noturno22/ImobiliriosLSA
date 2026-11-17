# Pendências — Filtro completo de imóveis e área de vídeos

Data de registo: 2026-11-17
Última atualização: 2026-11-17 (lint/typecheck/build corrigidos e a passar)
Referência visual: `apps/web/public/brand/filtro.png`

## Objetivo

1. Tornar a pesquisa em `/imoveis` tão completa quanto o filtro da imagem e totalmente funcional.
2. Criar uma área de vídeos estilo TikTok/YouTube Reels, com scroll vertical entre imóveis, curtir, comentar e contactar.

## Estado atual (após sessão 2026-11-17)

**Implementação completa. `pnpm typecheck` ✅ PASSA. `pnpm lint` ✅ PASSA (0 erros). `pnpm build` ✅ PASSA (13 páginas geradas; 1 warning transitório de rede no Google Fonts na 1.ª execução). Testes manuais no browser por fazer (secção 8.3).**

### Decisões fechadas pelo utilizador (secção 6 — todas respondidas)

1. Tipologia = **mínimo** (T2 = 2+ quartos). T0 = estúdio (bedrooms = 0 exacto).
2. Ambos os checkboxes desmarcados = **mostrar todos** (sem filtro de origem).
3. Zona = **lista dinâmica** de bairros do município selecionado (via `/api/locations`).
4. Fonte dos vídeos = **PropertyMedia VIDEO + editoriais (content.ts)**, com suporte YouTube/Shorts/TikTok.
5. Curtidas/comentários = **anónimos com ID estável** (localStorage `regis_anon_id`).
6. Comentários = **publicação imediata** (sem moderação prévia; rate limit + spam check).
7. Contacto no vídeo = **formulário do imóvel (`#pedido`) + WhatsApp** (fallback `/contacto`).
8. Upload de vídeo = **apenas URLs externos** (YouTube/TikTok/MP4/WebM). A home existente deve ser responsiva e no mobile transformar-se em Reels.

### Ficheiros criados

- `apps/web/src/components/property-filter.tsx` — filtro completo client-side
- `apps/web/src/app/api/locations/route.ts` — municípios/bairros dinâmicos
- `apps/web/src/app/videos/page.tsx` — rota pública de vídeos
- `apps/web/src/components/video-reels.tsx` — feed vertical, likes, comentários, contacto
- `apps/web/src/lib/videos.ts` — parser URL, carga de reels, like states, comentários
- `apps/web/src/app/api/videos/route.ts` — feed JSON
- `apps/web/src/app/api/videos/[id]/like/route.ts` — GET/POST toggle like
- `apps/web/src/app/api/videos/[id]/comments/route.ts` — GET/POST comentários
- `packages/validation/src/video.ts` — schemas like/comentário + spam check
- `packages/database/prisma/migrations/20261117000000_init/migration.sql` — schema completo
- `packages/database/prisma/migrations/20261117120000_listing_source_video_tables/migration.sql` — upgrade delta

### Ficheiros modificados

- `packages/database/prisma/schema.prisma` — `ListingSource` em `Property`, `VideoLike`, `VideoComment`, índices
- `packages/database/src/pglite-ddl.ts` — regenerado
- `packages/database/src/client.ts` — `upgradePgliteSchema()` idempotente para bases existentes
- `packages/database/src/seed-sample.ts` e `prisma/seed.ts` — `listingSource`
- `packages/domain/src/enums.ts` — `ListingSource`
- `packages/domain/src/property.ts` — `listingSource` em `Property`/`PropertySummary`
- `packages/validation/src/property.ts` — `listingSource` no schema
- `packages/validation/src/search.ts` — `listingSource`, `tipologia`, `q`, `municipality`, `neighborhood`, `minArea`, `maxArea`, `sort`
- `packages/validation/src/index.ts` — export de `./video`
- `apps/web/src/lib/properties.ts` — busca completa (OR text search, sort, listingSource, etc.) + `buildQueryString` + `getMunicipalities`/`getNeighborhoods`
- `apps/web/src/lib/labels.ts` — `listingSourceLabels`, `TIPOLOGIA_OPTIONS`
- `apps/web/src/lib/site.ts` — `NAV_LINKS` com `/videos`
- `apps/web/src/components/site-header.tsx` — item `Vídeos` no nav (desktop + mobile)
- `apps/web/src/components/admin/property-form.tsx` — select Anunciante + secção Vídeos (URLs)
- `apps/web/src/app/admin/(painel)/imoveis/actions.ts` — grava `listingSource` e media `type` IMAGE/VIDEO
- `apps/web/src/app/admin/(painel)/imoveis/[id]/page.tsx` — mapeia `listingSource`, separa imagens/vídeos
- `apps/web/src/app/imoveis/page.tsx` — usa `PropertyFilter`, chips de operação/tipologia, active filters, contagem
- `apps/web/src/app/imoveis/[slug]/page.tsx` — `PropertyVideo` separado da galeria de imagens
- `apps/web/src/components/video-gallery.tsx` — mobile: snap horizontal (Reels browse); desktop: grid 4 col; link "Ver tudo →" para `/videos`

---

## 1. Filtro completo de imóveis

### Campos a implementar

- [x] Origem/anunciante:
  - [x] Adicionar campo `listingSource` ao modelo `Property`.
  - [x] Valores: `PROFESSIONAL` e `PRIVATE`.
  - [x] UI com checkboxes `Profissionais` e `Particulares`.
  - [x] Definir comportamento quando ambos estão desmarcados → mostrar todos.
  - [x] Persistir no URL (`listingSource=PROFESSIONAL` ou `PROFESSIONAL,PRIVATE`) e aplicar na consulta.
- [x] Tipo de negócio:
  - [x] Reutilizar `transactionType` (`SALE`/`RENT`).
  - [x] Opções em português: `Todos`, `Venda`, `Arrendamento`.
- [x] Tipo de imóvel:
  - [x] Reutilizar `propertyType`.
  - [x] Manter labels existentes de `propertyTypeLabels`.
- [x] Tipologia:
  - [x] Mapeamento T0–T5+ (`TIPOLOGIA_OPTIONS` em `labels.ts`).
  - [x] Filtra mínimo (T2 = bedrooms ≥ 2); T0 = bedrooms = 0 exacto (estúdio).
  - [x] Imóveis sem quartos (terrenos, `bedrooms = null`) não casam com filtro de tipologia.
- [x] Localização:
  - [x] País fixo: `Angola`.
  - [x] Província existente em `PROVINCES`.
  - [x] Município dinâmico (`/api/locations`).
  - [x] Zona/bairro dinâmico usando `neighborhood`.
  - [x] Dependência província → município → zona.
- [x] Preço:
  - [x] Mínimo.
  - [x] Máximo.
  - [x] Validar que mínimo não supera máximo (refine em `propertySearchSchema`).
  - [x] Valores em Kz → `priceAmountMinor` (BigInt × 100).
- [x] Pesquisa textual:
  - [x] Campo `Pesquisar...`.
  - [x] Pesquisa em título, descrição, referência, município, bairro, comodidades (OR case-insensitive).
  - [x] Parâmetro `q` no URL.
- [x] Resultados:
  - [x] Contagem total dentro do botão (`123 RESULTADOS`).
  - [x] Atualiza com filtros ativos (server re-render por query string).
  - [x] `aria-live="polite"` na contagem.
- [ ] Completar opções opcionais (parcial):
  - [x] Casas de banho (`bathrooms` no schema/search; não visível no UI do filtro).
  - [ ] Estacionamento (schema existe? não — `parkingSpaces` só no form admin).
  - [x] Área mínima/máxima (`minArea`/`maxArea` no schema/search; não visível no UI).
  - [ ] Comodidades (schema `amenities` existe; não visível no UI do filtro).
  - [x] Ordenação usando `PropertySort` (implementada em `searchProperties`; não visível no UI).
  - [x] Paginação já existente.

### Ficheiros prováveis

- [x] `apps/web/src/app/imoveis/page.tsx`
- [ ] `apps/web/src/components/search-panel.tsx` (home — não alterado; pode receber listingSource futuro)
- [x] `apps/web/src/components/property-filter.tsx` (novo)
- [x] `apps/web/src/lib/properties.ts`
- [x] `packages/validation/src/search.ts`
- [x] `packages/domain/src/enums.ts`
- [x] `packages/domain/src/property.ts`
- [x] `apps/web/src/lib/labels.ts`

### Comportamento esperado no URL

- [x] Todos os filtros serializados no query string (`buildQueryString`).
- [x] Remover filtros individuais sem perder os restantes (chips activos).
- [x] Limpar todos os filtros (botão `Limpar filtros`).
- [x] Voltar atrás/avançar restaura a pesquisa (navegação nativa do browser).
- [x] Pesquisa partilhável por URL.

---

## 2. Base de dados para o filtro

- [x] Associar `ListingSource` ao modelo `Property`:
  ```prisma
  listingSource ListingSource @default(PROFESSIONAL)
  ```
- [x] Valor por omissão para registos existentes (`DEFAULT 'PROFESSIONAL'` no ALTER/upgrade).
- [x] Índice `@@index([listingSource])`.
- [x] Atualizar `packages/domain/src/property.ts`.
- [x] Atualizar `packages/validation/src/property.ts`.
- [x] Atualizar admin de imóveis:
  - [x] `apps/web/src/components/admin/property-form.tsx`
  - [x] `apps/web/src/app/admin/(painel)/imoveis/actions.ts`
  - [x] `apps/web/src/app/admin/(painel)/imoveis/[id]/page.tsx`
- [x] Atualizar seeds:
  - [x] `packages/database/prisma/seed.ts`
  - [x] `packages/database/src/seed-sample.ts`
- [x] Gerar cliente Prisma (`prisma generate` — 2026-11-17).
- [x] Regenerar `packages/database/src/pglite-ddl.ts` (`db:pglite:ddl`).
- [x] Criar migrações:
  - [x] `20261117000000_init` (schema completo, para BD nova).
  - [x] `20261117120000_listing_source_video_tables` (delta, para BD existente).
- [x] Upgrade de bases PGlite existentes: `upgradePgliteSchema()` em `client.ts` (idempotente: CREATE TYPE/ALTER TABLE/CREATE TABLE IF NOT EXISTS).
- [x] Não apagar dados existentes (todas as operações são aditivas).

---

## 3. Área de vídeos / Reels

### Experiência

- [x] Nova rota pública `/videos`.
- [x] Entrada na navegação:
  - [x] `apps/web/src/components/site-header.tsx` (desktop + menu móvel).
  - [x] `apps/web/src/lib/site.ts` (`NAV_LINKS`).
  - [x] menu móvel (mesmo `NAV_ITEMS`).
- [x] Feed vertical quase ecrã inteiro (`h-[70vh]` / `sm:h-[75vh]`).
- [x] Scroll com snap entre vídeos (`snap-y snap-mandatory` + `snap-start`).
- [x] Reproduz automaticamente apenas o vídeo visível (IntersectionObserver threshold 0.6).
- [x] Pausa vídeos que saem do ecrã.
- [x] Suporte a:
  - [x] vídeos MP4/WebM diretos (`<video>`).
  - [x] YouTube/YouTube Shorts (iframe nocookie).
  - [x] TikTok (link "Ver no TikTok" — embed oficial não é fiável sem widget).
- [x] Botões anterior/seguinte (setas ↑/↓).
- [x] Navegação por teclado (ArrowUp/ArrowDown/PageUp/PageDown).
- [x] Botão de som (muted por default, toggle).
- [x] Indicador de posição (`2 / 10` + `sr-only`).

### Cada vídeo deve mostrar

- [x] Imóvel associado (quando `source = property`).
- [x] Título.
- [x] Localização.
- [x] Preço.
- [x] Ligação para `/imoveis/[slug]` ("Ver imóvel").
- [x] Botão `Contactar` (`#pedido` / WhatsApp / `/contacto`).
- [x] Botão `Curtir` com contagem.
- [x] Botão `Comentários` com contagem.
- [x] Painel/lista de comentários (drawer lateral).
- [x] Formulário para publicar comentário (nome + texto).

### Fonte dos vídeos

- [x] Decidir a fonte principal → **PropertyMedia VIDEO + editoriais content.ts** (decisão do utilizador).
- [x] Parser de URL (`parseVideoUrl` em `lib/videos.ts`): YouTube/Shorts, TikTok, MP4/WebM.
- [x] Vídeos não aparecem como imagens partidas na galeria (`type === "IMAGE"` filtrado no detail).
- [x] Detalhe do imóvel apresenta vídeo (`PropertyVideo` em `imoveis/[slug]/page.tsx`).
- [x] Admin distingue imagens de vídeos:
  - [x] separar URLs (`mediaUrls` + `videoUrls`).
  - [x] definir `PropertyMedia.type` correctamente (IMAGE/VIDEO).
  - [ ] permitir upload de vídeo → **decidido: NÃO** (apenas URLs externos).
  - [x] limitar formato nos URLs aceites (parser valida extensão/YouTube/TikTok).

### Curtir

- [x] Persistência: **base de dados** (`VideoLike`).
- [x] Modelo `VideoLike` criado no schema.
- [x] Identificador anónimo estável (`localStorage` `regis_anon_id`, UUID sem hífens).
- [x] Impede múltiplas curtidas (`@@unique([videoId, anonId])`).
- [x] Permite remover a curtição (toggle POST).
- [x] API route para toggle e contagem (`/api/videos/[id]/like`).
- [x] Validação de ID (`videoLikeSchema`).

### Comentários

- [x] Modelo `VideoComment` criado no schema.
- [x] API route para listar e criar (`/api/videos/[id]/comments`).
- [x] Validação:
  - [x] nome/autor (2–60 chars).
  - [x] texto mínimo (2) e máximo (800).
  - [x] conteúdo vazio (trim + min).
  - [x] links/spam básico (`looksLikeSpam`: >2 links ou repeated chars).
- [x] Limitar taxa de publicação (5/min por anonId, in-memory).
- [x] Não confiar em dados do cliente para contagens (contagens sempre do servidor).
- [x] Moderação: publicação imediata (decisão); admin futura opcional.

### Contactar

- [x] Vídeo com imóvel → `/imoveis/[slug]#pedido`.
- [x] Vídeo sem imóvel → WhatsApp (`whatsappLink`) ou `/contacto`.
- [x] Reutilizar:
  - [x] `whatsappLink()` de `apps/web/src/lib/site.ts`.
  - [ ] `property-lead-form.tsx` — não embutido no drawer; o `#pedido` leva ao form existente.
  - [ ] `api/leads` — não chamado directamente do vídeo (futuro: lead source VIDEO).
- [ ] Registar origem do lead como vídeo → **por fazer se necessário** (LeadSource não tem VIDEO).

### Ficheiros prováveis para vídeos

- [x] `apps/web/src/app/videos/page.tsx`
- [x] `apps/web/src/components/video-reels.tsx` (inclui comments + item + player; não separado em 3 ficheiros)
- [ ] `apps/web/src/components/video-reel-item.tsx` (inline em `video-reels.tsx`)
- [ ] `apps/web/src/components/video-comments.tsx` (inline em `video-reels.tsx`)
- [x] `apps/web/src/lib/videos.ts`
- [x] `apps/web/src/app/api/videos/route.ts`
- [x] `apps/web/src/app/api/videos/[id]/like/route.ts`
- [x] `apps/web/src/app/api/videos/[id]/comments/route.ts`
- [x] `packages/database/prisma/schema.prisma`
- [ ] `packages/domain` — sem tipo `VideoReel` dedicado (tipos vivem em `lib/videos.ts`)
- [x] `packages/validation/src/video.ts`

---

## 4. Migrações e atualização do ambiente

- [x] Criar diretório `packages/database/prisma/migrations`.
- [x] Migrações geradas:
  - [x] `20261117000000_init` — schema completo (BD nova).
  - [x] `20261117120000_listing_source_video_tables` — delta para BD existente.
- [x] Executar `prisma generate`.
- [x] Executar `db:pglite:ddl`.
- [x] Upgrade PGlite: `upgradePgliteSchema()` corre quando `Property` já existe.
- [ ] Verificar upgrade de `apps/web/.env.local`/`.data/regis` no browser (por fazer).
- [ ] Decidir processo para produção:
  - [x] `prisma migrate deploy` (migrações criadas) — **ou**
  - [x] `prisma db push` continua válido se for a prática actual.
- [x] PGlite suporta o processo (upgrade aditivo no `client.ts`).
- [x] Bases existentes recebem colunas/tabelas novas (IF NOT EXISTS + DEFAULT).

---

## 5. Testes e verificação

- [ ] Pesquisa por cada filtro individual.
- [ ] Pesquisa combinada.
- [ ] Remover um filtro sem perder os restantes.
- [ ] Limpar filtros.
- [ ] Preço mínimo maior que máximo.
- [ ] Pesquisa textual sem resultados.
- [ ] Tipologia para T0–T5+.
- [ ] Profissionais e Particulares.
- [ ] Paginação.
- [ ] URL partilhada reproduz os mesmos resultados.
- [ ] Vídeo reproduz automaticamente apenas quando visível.
- [ ] Vídeo pausa ao sair do ecrã.
- [ ] Scroll para anterior/seguinte.
- [ ] Curtir/descurtir sem duplicar contagem.
- [ ] Publicar comentário e aparecer na lista.
- [ ] Comentário inválido é rejeitado.
- [ ] Contactar abre o destino correto.
- [ ] Admin consegue criar/editar anúncio com origem e vídeo.
- [ ] Mobile e desktop.
- [ ] Acessibilidade por teclado e leitor de ecrã.
- [x] `pnpm typecheck` — **PASSA**
- [x] `pnpm lint` — **PASSA** (0 erros, 0 warnings)
- [x] `pnpm build` — **PASSA** (após corrigir lint; 1.ª falha foi rede Google Fonts, transitória)
- [ ] testes existentes, se forem adicionados.

---

## 6. Decisões pendentes do utilizador

**TODAS FECHADAS** — ver secção "Decisões fechadas" no topo.

---

## 7. Ordem sugerida para retomar

1. ~~Fechar decisões da secção 6.~~ ✅
2. ~~Completar `listingSource` no domínio, validação, Prisma e admin.~~ ✅
3. ~~Gerar cliente/migração/DDL e corrigir upgrade de bases existentes.~~ ✅
4. ~~Implementar e testar o filtro completo em `/imoveis`.~~ ✅ (testes manuais por fazer)
5. ~~Definir fonte dos vídeos e criar o modelo/API necessários.~~ ✅
6. ~~Implementar o feed vertical e o player responsivo.~~ ✅
7. ~~Implementar likes, comentários e contacto.~~ ✅
8. ~~Adicionar navegação, SEO, estados vazios e acessibilidade.~~ ✅ (SEO básico; testar a11y)
9. ~~Correr lint, typecheck e build~~ ✅ **TODOS PASSAM**
10. Rever manualmente no browser, desktop e mobile. ← PRÓXIMO PASSO

---

## 8. TRABALHO PENDENTE IMEDIATO (para retomar)

### 8.1 Corrigir `pnpm lint` ✅ FEITO (2026-11-17)

Correções aplicadas:

1. **`apps/web/src/app/imoveis/page.tsx`** — import `type PropertySearchInput` não usado removido.
2. **`apps/web/src/components/property-filter.tsx`** — removidos todos os `setState` síncronos dos effects:
   - Resets de município/zona/opções movidos para handlers `onProvinceChange`/`onMunicipalityChange` nos selects.
   - Effects passaram a fazer apenas fetch assíncrono, com guards `useRef` (`fetchedProvince`, `fetchedNeighborhoodsKey`) para evitar pedidas duplicadas e nunca limpar opções do servidor no mount.
3. **`apps/web/src/components/video-reels.tsx`**:
   - `CommentsPanel`: `loading` inicializa a `true` (o painel só monta aberto); removido `setLoading(true)` do effect.
   - Removido `anonId` (`useMemo`) não usado e o import `useMemo`.
   - Removido `useEffect(() => setReels(initialReels), ...)`; substituído por sync em render-time (`prevInitialReels`).

Resultado: **`pnpm lint` PASSA com 0 erros e 0 warnings.**

### 8.2 Correr verificação completa ✅ FEITO (2026-11-17)

```bash
pnpm lint        # ✅ PASSA (0 erros)
pnpm typecheck   # ✅ PASSA
pnpm build       # ✅ PASSA (13 páginas; 1.ª tentativa falhou só por rede ao Google Fonts — transitório)
```

### 8.3 Verificação manual no browser ← PRÓXIMO PASSO

- `pnpm dev` e testar:
  - `/imoveis` — todos os filtros, URL partilhável, chips, contagem no botão.
  - `/videos` — scroll snap, autoplay, likes, comentários, contacto.
  - Home — secção de vídeos horizontal no mobile (Reels browse), grid no desktop.
  - Admin — criar imóvel com `listingSource` e URLs de vídeo.
  - Detalhe do imóvel — vídeo embeddado separado das imagens.
  - Upgrade PGlite — abrir app com BD existente e confirmar que não crash (coluna `listingSource` + tabelas novas criadas).

### 8.4 Opcionais / melhorias futuras

- Expor `bathrooms`, `minArea`/`maxArea`, `amenities`, `sort` no UI do filtro (já suportados na query).
- `search-panel.tsx` (home) — alinhar com o novo filtro (adicionar listingSource/tipologia).
- Lead source `VIDEO` em `LeadSource` se se quiser atribuir leads vindos dos vídeos.
- Separação de `video-reels.tsx` em `video-reel-item.tsx` + `video-comments.tsx` se o ficheiro crescer.
- Moderção/admin de comentários no painel admin.
- TikTok embed oficial (oactual é link externo).
- Testes automatizados (não há framework definido no repo).
- Auto-host das fontes Google (`next/font/local`) para builds offline/CI sem rede.
