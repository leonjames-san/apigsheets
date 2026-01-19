/**
 * API REST para Google Sheets
 * Autor: Gemini
 * * Instruções de Instalação:
 * 1. Cole este código no editor de script da sua planilha (Extensões > Apps Script).
 * 2. Clique em "Implantar" (Deploy) > "Nova implantação".
 * 3. Selecione o tipo "App da Web".
 * 4. Configure "Executar como" -> "Eu" (seus dados).
 * 5. Configure "Quem pode acessar" -> "Qualquer pessoa" (para acesso externo fácil) ou "Qualquer pessoa com conta Google".
 * 6. Copie a URL gerada (URL da API).
 */

// Configuração: Define qual coluna é a Chave Primária (ID) para Updates/Deletes
// 0 = Coluna A, 1 = Coluna B, etc.
const ID_COLUMN_INDEX = 0; 

// --- Ponto de Entrada: GET ---
function doGet(e) {
  return handleRequest(e);
}

// --- Ponto de Entrada: POST (também simula PUT e DELETE) ---
function doPost(e) {
  return handleRequest(e);
}

// --- Controlador Principal ---
function handleRequest(e) {
  // Bloqueio para evitar erros de concorrencia
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Espera até 10s

  try {
    const params = e.parameter;
    
    // Tenta ler o corpo da requisição se for POST/JSON
    let postData = {};
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        // Se falhar o parse, assume que são parâmetros de formulário
        postData = e.parameter;
      }
    }

    // Unifica parâmetros da URL e do Corpo, priorizando o corpo
    const request = { ...params, ...postData };
    const action = request.action;

    let result;

    switch (action) {
      // --- Operações de Estrutura (Abas) ---
      case 'getSheets':
        result = listSheets();
        break;
      case 'addSheet':
        result = createSheet(request.sheetName);
        break;
      case 'renameSheet':
        result = renameSheet(request.sheetName, request.newSheetName);
        break;
      case 'deleteSheet':
        result = deleteSheet(request.sheetName);
        break;

      // --- Operações de Dados (CRUD) ---
      case 'read':
        result = readData(request.sheetName);
        break;
      case 'create': // POST
        result = createData(request.sheetName, request.data);
        break;
      case 'update': // PUT
        result = updateData(request.sheetName, request.id, request.data);
        break;
      case 'delete': // DELETE
        result = deleteRow(request.sheetName, request.id);
        break;
      case 'renameColumn': // Renomear coluna
        result = renameColumn(request.sheetName, request.oldColumnName, request.newColumnName);
        break;

      default:
        throw new Error("Ação inválida ou não fornecida. Ações válidas: getSheets, addSheet, renameSheet, deleteSheet, read, create, update, delete, renameColumn.");
    }

    return responseJSON({ status: 'success', data: result });

  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// FUNÇÕES DE GERENCIAMENTO DE ABAS
// ==========================================

function listSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  return sheets.map(sheet => sheet.getName());
}

function createSheet(sheetName) {
  if (!sheetName) throw new Error("Nome da aba (sheetName) é obrigatório.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (ss.getSheetByName(sheetName)) {
    throw new Error(`A aba '${sheetName}' já existe.`);
  }
  
  ss.insertSheet(sheetName);
  return `Aba '${sheetName}' criada com sucesso.`;
}

function deleteSheet(sheetName) {
  if (!sheetName) throw new Error("Nome da aba (sheetName) é obrigatório.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) throw new Error(`A aba '${sheetName}' não foi encontrada.`);
  if (ss.getSheets().length === 1) throw new Error("Não é possível excluir a única aba da planilha.");
  
  ss.deleteSheet(sheet);
  return `Aba '${sheetName}' excluída com sucesso.`;
}

function renameSheet(sheetName, newSheetName) {
  if (!sheetName) throw new Error("Nome da aba (sheetName) é obrigatório.");
  if (!newSheetName) throw new Error("Novo nome da aba (newSheetName) é obrigatório.");
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) throw new Error(`A aba '${sheetName}' não foi encontrada.`);
  if (ss.getSheetByName(newSheetName)) throw new Error(`A aba '${newSheetName}' já existe.`);
  
  sheet.setName(newSheetName);
  return `Aba renomeada de '${sheetName}' para '${newSheetName}' com sucesso.`;
}

// ==========================================
// FUNÇÕES CRUD DE DADOS
// ==========================================

// READ: Lê toda a tabela e retorna JSON (assuma linha 1 como cabeçalho)
function readData(sheetName) {
  const sheet = getSheetOrThrow(sheetName);
  const rows = sheet.getDataRange().getValues();
  
  if (rows.length === 0) return [];

  const headers = rows[0];
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    let rowObj = {};
    for (let j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = rows[i][j];
    }
    data.push(rowObj);
  }
  return data;
}

// CREATE: Adiciona uma nova linha
function createData(sheetName, dataObj) {
  if (!dataObj) throw new Error("Objeto de dados (data) é obrigatório.");
  
  const sheet = getSheetOrThrow(sheetName);
  
  // Se a planilha estiver vazia, cria cabeçalhos baseados nas chaves do objeto
  if (sheet.getLastRow() === 0) {
    const headers = Object.keys(dataObj);
    sheet.appendRow(headers);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const newRow = [];

  // Mapeia os dados recebidos para a ordem correta das colunas
  headers.forEach(header => {
    newRow.push(dataObj[header] || ""); // Se não vier dado para a coluna, deixa vazio
  });

  sheet.appendRow(newRow);
  return "Registro criado com sucesso.";
}

// UPDATE: Atualiza uma linha baseada no ID (Coluna A por padrão)
function updateData(sheetName, id, dataObj) {
  if (!id) throw new Error("ID é obrigatório para atualização.");
  if (!dataObj) throw new Error("Dados para atualização são obrigatórios.");

  const sheet = getSheetOrThrow(sheetName);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  let rowIndex = -1;

  // Procura o ID na coluna configurada (ID_COLUMN_INDEX)
  // Loop começa em 1 para pular cabeçalho
  for (let i = 1; i < values.length; i++) {
    // Conversão para string para garantir comparação frouxa (ex: "1" == 1)
    if (String(values[i][ID_COLUMN_INDEX]) === String(id)) {
      rowIndex = i + 1; // +1 porque getRange é base 1
      break;
    }
  }

  if (rowIndex === -1) throw new Error(`ID '${id}' não encontrado na aba '${sheetName}'.`);

  // Atualiza as células correspondentes
  headers.forEach((header, colIndex) => {
    if (dataObj.hasOwnProperty(header)) {
      // +1 no colIndex pois getCell é base 1
      sheet.getRange(rowIndex, colIndex + 1).setValue(dataObj[header]);
    }
  });

  return `Registro com ID '${id}' atualizado.`;
}

// DELETE: Remove linha baseada no ID
function deleteRow(sheetName, id) {
  if (!id) throw new Error("ID é obrigatório para exclusão.");

  const sheet = getSheetOrThrow(sheetName);
  const values = sheet.getDataRange().getValues();
  
  let rowIndex = -1;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][ID_COLUMN_INDEX]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) throw new Error(`ID '${id}' não encontrado.`);

  sheet.deleteRow(rowIndex);
  return `Registro com ID '${id}' excluído.`;
}

// RENAME COLUMN: Renomeia uma coluna (cabeçalho)
function renameColumn(sheetName, oldColumnName, newColumnName) {
  if (!oldColumnName) throw new Error("Nome da coluna atual (oldColumnName) é obrigatório.");
  if (!newColumnName) throw new Error("Novo nome da coluna (newColumnName) é obrigatório.");

  const sheet = getSheetOrThrow(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  let columnIndex = -1;

  // Procura o índice da coluna
  for (let i = 0; i < headers.length; i++) {
    if (headers[i] === oldColumnName) {
      columnIndex = i;
      break;
    }
  }

  if (columnIndex === -1) throw new Error(`Coluna '${oldColumnName}' não encontrada.`);

  // Verifica se o novo nome já existe
  if (headers.includes(newColumnName)) {
    throw new Error(`A coluna '${newColumnName}' já existe.`);
  }

  // Atualiza o cabeçalho (linha 1)
  sheet.getRange(1, columnIndex + 1).setValue(newColumnName);

  return `Coluna renomeada de '${oldColumnName}' para '${newColumnName}' com sucesso.`;
}

// ==========================================
// UTILITÁRIOS
// ==========================================

function getSheetOrThrow(sheetName) {
  if (!sheetName) throw new Error("Nome da aba (sheetName) não especificado.");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Aba '${sheetName}' não existe.`);
  return sheet;
}

function responseJSON(content) {
  return ContentService
    .createTextOutput(JSON.stringify(content))
    .setMimeType(ContentService.MimeType.JSON);
}