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

**Próximos Passos:**
- Fazer login no Vercel CLI
- Deploy efetivo no Vercel
- Configurar variáveis de ambiente na plataforma
- Validar funcionamento pós-deploy

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
- [A ser documentado pelo agente]

### Soluções Aplicadas
- [A ser documentado pelo agente]

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