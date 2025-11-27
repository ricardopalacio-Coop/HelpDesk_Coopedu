/**
 * Script para atualizar IDs dos contratos existentes para o padrão UF+sequencial
 * 
 * Formato: [código UF (1-2 dígitos)][sequencial (3 dígitos)]
 * Exemplo: RN (20) + 001 = 20001
 */

import mysql from 'mysql2/promise';
import 'dotenv/config';

const UF_CODES = {
  'AC': 1, 'AL': 2, 'AP': 3, 'AM': 4, 'BA': 5, 'CE': 6, 'DF': 7, 'ES': 8,
  'GO': 9, 'MA': 10, 'MT': 11, 'MS': 12, 'MG': 13, 'PA': 14, 'PB': 15,
  'PR': 16, 'PE': 17, 'PI': 18, 'RJ': 19, 'RN': 20, 'RS': 21, 'RO': 22,
  'RR': 23, 'SC': 24, 'SP': 25, 'SE': 26, 'TO': 27
};

function generateContractId(state, sequentialNumber) {
  const ufCode = UF_CODES[state.toUpperCase()];
  if (!ufCode) {
    throw new Error(`UF inválida: ${state}`);
  }
  
  const sequential = sequentialNumber.toString().padStart(3, '0');
  return parseInt(`${ufCode}${sequential}`);
}

async function main() {
  console.log('🔧 Iniciando atualização de IDs de contratos...\n');
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Buscar todos os contratos ordenados por UF e ID atual
    const [contracts] = await connection.execute(
      'SELECT id, name, city, state FROM contracts WHERE isSpecial = 0 ORDER BY state, id'
    );
    
    console.log(`📋 Encontrados ${contracts.length} contratos para atualizar\n`);
    
    // Agrupar contratos por UF
    const contractsByState = {};
    for (const contract of contracts) {
      const state = contract.state.toUpperCase();
      if (!contractsByState[state]) {
        contractsByState[state] = [];
      }
      contractsByState[state].push(contract);
    }
    
    // Desabilitar verificação de chave estrangeira temporariamente
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Atualizar IDs por UF
    for (const [state, stateContracts] of Object.entries(contractsByState)) {
      console.log(`\n🏷️  Atualizando contratos de ${state}:`);
      
      for (let i = 0; i < stateContracts.length; i++) {
        const contract = stateContracts[i];
        const oldId = contract.id;
        const newId = generateContractId(state, i + 1);
        
        if (oldId !== newId) {
          console.log(`   ${contract.name}: ${oldId} → ${newId}`);
          
          // Atualizar ID do contrato
          await connection.execute(
            'UPDATE contracts SET id = ? WHERE id = ?',
            [newId, oldId]
          );
          
          // Atualizar referências em cooperados (se existirem)
          await connection.execute(
            'UPDATE cooperados SET contractId = ? WHERE contractId = ?',
            [newId, oldId]
          );
        } else {
          console.log(`   ${contract.name}: ${oldId} (já está correto)`);
        }
      }
    }
    
    // Reabilitar verificação de chave estrangeira
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Atualização concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar IDs:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
