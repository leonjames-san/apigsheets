# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [1.0.1] - 2026-01-19

### Fixed
- **Bug crítico na renderização de tabela**: Linhas de dados não estavam sendo adicionadas ao `<tbody>`. Adicionado `tbody.appendChild(tr)` no loop de renderização.
- Melhorado sistema de logs no console para facilitar debugging
- Adicionado logs detalhados na função `apiRequest()` para rastrear resposta bruta e parseada
- Melhorado `loadTableData()` com logs mais verbosos sobre estrutura de dados

### Added
- Logs de debug detalhados em `renderTable()` mostrando estrutura de dados e cabeçalhos
- Verificação de tipo de dados e quantidade de registros
- Rastreamento de cada etapa do processo de renderização

### Improved
- Seleção automática da primeira aba após conectar ao Google Sheets
- Tratamento de dados vazios com mensagens mais claras no console

## [1.0.0] - 2026-01-19

### Added
- Painel web completo para gerenciar Google Sheets via API
- Interface com Tailwind CSS e Lucide Icons
- Funcionalidades CRUD completas:
  - Ler dados de abas
  - Criar novos registros
  - Editar registros existentes
  - Deletar registros
  - Gerenciar abas (criar e deletar)
- Modal de formulário dinâmico
- Carregamento de abas via API
- Servidor HTTP local (Python)
- Integração com Google Apps Script via Clasp
- README.md com instruções de uso
- Sistema de autenticação via URL do Web App

---

**Formato de versionamento**: [MAJOR.MINOR.PATCH]

- **MAJOR**: Mudanças incompatíveis ou novas funcionalidades grandes
- **MINOR**: Novas funcionalidades compatíveis com versões anteriores
- **PATCH**: Correções de bugs e melhorias pequenas
