# API GSheets

Painel web e API REST para gerenciar dados em uma planilha Google Sheets.

## Conteúdo do repositório

- `index.html` — Interface web para conectar ao Web App do Google Apps Script e gerenciar abas/ registros.
- `src/` — Código do Google Apps Script (sincronizado via `clasp`).
  - `.clasp.json` — configuração do Clasp
  - `appsscript.json` — manifest do projeto
  - `Código.js` — implementação da API (endpoints: getSheets, read, create, update, delete, addSheet, deleteSheet)

## Uso

1. Abra `index.html` em um navegador.
2. Cole a URL do seu Web App (Apps Script) no campo "Cole a URL do Web App (exec) aqui..." e clique em "Conectar".

OBS: Para funcionar corretamente, faça o deploy do Apps Script como *Web App* com acesso "Qualquer pessoa, mesmo anônima" ou ajuste as permissões conforme necessário.

## Como desenvolver / sincronizar o Apps Script

Pré-requisitos:
- Node.js + npm
- clasp instalado globalmente (`npm i -g @google/clasp`)
- Autenticação via `clasp login`

Comandos úteis:

```powershell
cd "d:\Users\leon.james\Documents\Sistemas\API GSheets\src"
clasp pull    # baixa alterações do projeto remoto
clasp push    # envia alterações locais para o Apps Script
clasp deploy  # cria nova implantação (ou use clasp deploy --help para opções)
```

## Informações adicionais

- Script ID do projeto Apps Script: `1BHii6BgXqmyhuyhQ-Py5hP8m43C2sT7ifOpbOwmHzqYYt_7_uJkThbli`
- Autor/Contatos:
  - GitHub: `leonjames-san`
  - Email: `leonprata47@gmail.com`

---

Criado automaticamente pelo assistente para facilitar o desenvolvimento e deploy do projeto.
