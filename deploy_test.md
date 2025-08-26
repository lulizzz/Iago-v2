# Deploy Test Documentation

Este documento serve como base de conhecimento para tentativas de deploy no Vercel, registrando sucessos, falhas e observações importantes.

## Histórico de Deploy

### Data: 2025-08-26 (Primeira Tentativa)
**Status:** PARCIAL
**Tentativa:** 1

**Ações Realizadas:**
- [x] Verificação do estado atual do projeto
- [x] Análise de configurações necessárias
- [x] Instalação do Vercel CLI (v46.0.4)
- [x] Instalação do pnpm
- [ ] Tentativa de deploy (bloqueada por login)
- [x] Documentação de resultados parciais

**Configurações Identificadas:**
- **Framework:** Next.js 15.3.0-canary.31 com App Router
- **Node Version:** Detectado package.json com pnpm@9.12.3
- **Build Command:** `pnpm build` (inclui migrações: `tsx lib/db/migrate && next build`)
- **Dependencies:** 748 packages identificados
- **Experimental:** PPR (Partial Prerendering) habilitado

**Erros Encontrados:**
1. **Vercel Login Requerido:** CLI solicita autenticação interativa
2. **Instalação de Dependências:** Timeout na instalação local com pnpm
3. **Processo Interativo:** Não foi possível completar login automaticamente

**Observações Críticas:**
- Projeto usa Next.js 15 canary com recursos experimentais
- Build script inclui migrações de banco (potencial problema no deploy)
- Dependências beta do AI SDK podem causar instabilidade
- React 19 RC pode não ser totalmente suportado no Vercel

**Erros de Build Resolvidos:**
1. **Dependência tsx ausente:** Adicionado `tsx@4.19.3` às devDependencies
2. **TypeScript - LanguageModelV2:** Adicionadas propriedades obrigatórias (specificationVersion, provider, modelId, supportedUrls)
3. **Type Safety:** Corrigido acesso à propriedade 'text' com type assertion
4. **Migrations no Build:** Modificado script de build para não executar migrações (separado em build:with-migrate)

**Build Local Bem-sucedido:**
- ✅ Compilação TypeScript: Sucesso
- ✅ Linting: Aprovado (apenas warnings)
- ✅ Geração de páginas estáticas: 20/20 páginas
- ✅ Otimização final: Concluída
- ⚠️ Warnings sobre bcrypt-ts e Edge Runtime (não bloqueia deploy)

**Configurações Aplicadas:**
- Criado vercel.json com configurações otimizadas
- Separação de builds com/sem migração
- Timeout de 30s para funções API
- Headers CORS configurados

**Status Final:** BUILD LOCAL APROVADO - PRONTO PARA DEPLOY

**Próximos Passos para Deploy Manual:**

1. **Login no Vercel:**
   ```bash
   vercel login
   # Escolha GitHub e faça a autenticação
   ```

2. **Primeiro Deploy:**
   ```bash
   cd "D:\Projetos GitHub\Iago-v2"
   vercel --prod
   # Responda as perguntas de configuração
   ```

3. **Configurar Variáveis de Ambiente no Dashboard Vercel:**
   - `POSTGRES_URL` - String de conexão do banco
   - `AUTH_SECRET` - Gerado com `openssl rand -base64 32`
   - `XAI_API_KEY` - Chave da API xAI (opcional)
   - `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob (opcional)
   - `REDIS_URL` - URL do Redis (opcional)
   - `N8N_WEBHOOK_URL` - URL do webhook N8N
   - `LESSONS_WEBHOOK_URL` - URL do webhook de lições

4. **Configurações Recomendadas no Vercel:**
   - **Build Command:** `pnpm build` (sem migrações)
   - **Install Command:** `pnpm install`
   - **Node.js Version:** 22.x (compatível com Next.js 15)
   - **Framework:** Next.js

**Arquivos Criados/Modificados para Deploy:**
- ✅ `vercel.json` - Configurações específicas do Vercel
- ✅ `package.json` - Scripts de build otimizados
- ✅ `lib/ai/providers.ts` - Correções TypeScript
- ✅ Commit realizado: `7bc2794`

---

## Configurações Importantes

### Variáveis de Ambiente Necessárias
- `POSTGRES_URL` - String de conexão PostgreSQL
- `AUTH_SECRET` - Segredo para NextAuth (usar: `openssl rand -base64 32`)
- `XAI_API_KEY` - Chave da API xAI (opcional, para modelo padrão)
- `BLOB_READ_WRITE_TOKEN` - Token Vercel Blob (opcional, para armazenamento)
- `REDIS_URL` - URL Redis (opcional, para cache)
- `LESSONS_WEBHOOK_URL` - URL webhook para lições (opcional)

### Comandos de Build
```bash
pnpm install
pnpm build  # Inclui migrações de banco
```

### Problemas Conhecidos
1. **Build Failures por Migrações:** O script original executava migrações durante build
   - **Solução:** Criado script `build` sem migrações e `build:with-migrate` separado
   
2. **TypeScript Errors em AI Providers:** Interface LanguageModelV2 não implementada completamente
   - **Solução:** Adicionadas propriedades obrigatórias e type assertions
   
3. **Dependência tsx Ausente:** Necessária para executar scripts TypeScript
   - **Solução:** Adicionado `tsx@4.19.3` às devDependencies
   
4. **Warnings bcrypt-ts + Edge Runtime:** Não compatível com Edge Functions
   - **Status:** Warnings apenas, não bloqueia build
   - **Recomendação:** Considerar mover auth para Node.js runtime se necessário

5. **React 19 RC + Next.js 15 Canary:** Versões em desenvolvimento
   - **Status:** Build funcional, mas pode haver instabilidades
   - **Recomendação:** Monitorar em produção

### Soluções Aplicadas
- ✅ Correção completa de erros de build TypeScript
- ✅ Configuração vercel.json otimizada
- ✅ Separação de scripts de build
- ✅ Headers CORS para APIs
- ✅ Timeout configurado para funções (30s)
- ✅ Build local 100% funcional

### Data: 2025-08-26 (Preparação Final)
**Status:** SUCESSO - PRONTO PARA DEPLOY
**Tentativa:** 2

**Ações Realizadas:**
- [x] Resolução de todos os erros de build
- [x] Adição da dependência tsx@4.19.3
- [x] Correção das interfaces TypeScript AI
- [x] Criação do vercel.json otimizado
- [x] Separação dos scripts de build
- [x] Commit das mudanças (7bc2794)
- [x] Build local 100% funcional
- [x] Documentação completa do processo

**Resultados do Build:**
```
✓ Compiled successfully
Route (app)                                 Size  First Load JS
┌ ƒ /                                      179 B         858 kB
├ ○ /_not-found                            988 B         117 kB
[... 20 rotas geradas com sucesso]
✓ Generating static pages (20/20)
✓ Finalizing page optimization
```

**Observações:**
- Build completado sem erros
- 20 páginas estáticas geradas
- Warnings de bcrypt-ts não bloqueiam deploy
- Projeto pronto para deploy em produção

**Arquivos de Deploy Criados:**
- `vercel.json` - Configuração da plataforma
- `deploy_test.md` - Esta documentação
- Scripts de build otimizados
- Correções TypeScript aplicadas

---

## Template para Novas Tentativas

Copie e preencha este template para cada nova tentativa:

```markdown
### Data: [DATA]
**Status:** [SUCESSO/FALHA/PARCIAL]
**Tentativa:** [NÚMERO]

**Ações Realizadas:**
- [ ] [Ação 1]
- [ ] [Ação 2]
- [ ] [Ação 3]

**Erros Encontrados:**
- [Erro 1 e solução tentada]
- [Erro 2 e solução tentada]

**Observações:**
- [Observações importantes]

**Próximos Passos:**
- [Ações para próxima tentativa]
```