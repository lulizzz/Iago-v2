# Configuração MCP (Model Context Protocol)

Este projeto usa MCP para estender as capacidades do Claude Code. O arquivo `.mcp.json` contém tokens sensíveis e não deve ser commitado no repositório.

## Como Configurar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .mcp.json.example .mcp.json
   ```

2. **Configure suas credenciais:**
   
   ### Supabase
   - Acesse seu projeto Supabase
   - Vá em Settings > API
   - Copie o `Project Reference ID` e substitua `YOUR_PROJECT_REF_HERE`
   - Gere um `Access Token` e substitua `YOUR_SUPABASE_ACCESS_TOKEN_HERE`

   ### 21st.dev Magic
   - Acesse https://21st.dev
   - Gere uma API key
   - Substitua `YOUR_21ST_DEV_API_KEY_HERE`

   ### GitHub (para shadcn-ui-mcp-server)
   - Acesse GitHub Settings > Developer settings > Personal access tokens
   - Gere um token com permissões de leitura de repositório
   - Substitua `YOUR_GITHUB_API_KEY_HERE`

## Serviços Disponíveis

- **browsermcp**: Controle de navegador web
- **supabase**: Integração com banco de dados Supabase
- **@21st-dev/magic**: Componentes UI e templates
- **shadcn-ui-mcp-server**: Componentes shadcn/ui

## Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.mcp.json` com tokens reais! Ele já está no `.gitignore`.