// db/deleteProduto.js
const pool = require('./conexao');

async function deleteFornecedorPorId(id_fornecedor) {
  try {
    const result = await pool.query('DELETE FROM fornecedores WHERE id_fornecedor = $1', [id_fornecedor]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Erro ao excluir fornecedor no banco:", error);
    throw error;
  }
}

module.exports = deleteFornecedorPorId;
