# Zenith Paste — Gerador de Raw para Loadstring

Site estilo Pastefy para gerar URLs raw de scripts Lua, ideais para `loadstring(game:HttpGet("URL"))()`. Os scripts são salvos no Firebase Realtime Database.

## Deploy no Cloudflare Pages

### Opção 1: Via Git (recomendado)

1. Crie um repositório no GitHub com os arquivos do projeto
2. No [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create project → Connect to Git
3. Conecte o repositório
4. **Build settings:**
   - Framework preset: None
   - Build command: (deixe vazio)
   - Build output directory: `/` (raiz)
5. Deploy

### Opção 2: Via Wrangler CLI

```bash
npm install -g wrangler
wrangler pages deploy . --project-name=lua-raw-generator
```

## Configurar Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com) → seu projeto (zenith-cloud-fff6b)
2. Realtime Database → Rules
3. Use as regras em `firebase-rules.json` (permite leitura e escrita para testes)
4. Para produção, considere restringir `.write` com autenticação

## Estrutura

```
lua-raw-generator/
├── index.html          # Página principal
├── app.js              # Lógica + Firebase
├── functions/          # Cloudflare Pages Functions
│   └── api/
│       └── raw/
│           └── [id].js # Endpoint que retorna o script como text/plain
├── firebase-rules.json # Regras do Realtime Database
├── wrangler.toml       # Config do Cloudflare
└── README.md
```

## Uso

1. Cole ou escreva seu script Lua no editor
2. (Opcional) Dê um nome ao script
3. Clique em **Salvar na Nuvem** — o script é salvo no Firebase
4. Copie a URL Raw ou o loadstring completo
5. Use no Roblox: `loadstring(game:HttpGet("SUA_URL_RAW"))()`
