# Reward Store API Integration

## Endpoints

### 1. Listar Catálogos
- **URL**: `GET /reward-store/catalog`
- **Descrição**: Retorna a lista de categorias/catálogos disponíveis
- **Resposta**:
```json
{
  "data": [
    {
      "id": "cat1",
      "name": "Eletrônicos"
    }
  ]
}
```

### 2. Listar Itens
- **URL**: `GET /reward-store/item`
- **Descrição**: Retorna a lista de itens/recompensas disponíveis
- **Resposta**:
```json
{
  "data": [
    {
      "id": "DTj7lVn",
      "name": "Fone de Ouvido",
      "description": "Fone de ouvido bluetooth",
      "cost": 100,
      "imageUrl": "https://example.com/image.jpg",
      "catalogId": "cat1",
      "amount": 10
    }
  ]
}
```

### 3. Criar Compra
- **URL**: `POST /reward-store/purchase/create`
- **Descrição**: Cria uma nova compra/resgate de recompensa
- **Payload**:
```json
{
  "item": "58b97dcee4b00e431b3135f7",
  "player": "jogador",
  "extra": {
    "upgrade": "house"
  }
}
```
- **Resposta**:
```json
{
  "success": true,
  "message": "Compra realizada com sucesso"
}
```

## Estratégia de Carregamento

1. **Carregamento de Categorias**: Primeiro carrega os catálogos para obter as categorias
2. **Carregamento de Itens**: Depois carrega os itens e os mapeia para as categorias usando `catalogId`
3. **Fallback para Mock**: Se a API falhar, usa dados mock para desenvolvimento

## Tratamento de Erros

- **Erro de Rede**: Mostra mensagem de erro e mantém dados mock
- **Erro de API**: Logs detalhados no console para debugging
- **Fallback**: Usa dados mock quando API não está disponível

## Placeholder de Imagem

- **Ícone**: Usa `ri-gift-fill` do Remix Icons
- **Estilo**: Consistente com o design do projeto
- **Aplicação**: Tanto na loja quanto no modal de resgate

## Resgate de Recompensas

### Fluxo de Resgate via API

1. **Validação**: Verifica se o usuário tem moedas suficientes
2. **Chamada API**: Envia POST para `/reward-store/purchase/create`
3. **Payload**: 
   - `item`: ID da recompensa
   - `player`: Email do usuário
   - `extra`: Objeto com informações adicionais (ex: `upgrade: "house"`)
4. **Sucesso**: 
   - Atualiza saldo de moedas no localStorage
   - Registra histórico de resgates
   - Mostra notificação de sucesso
5. **Erro**: Mostra mensagem de erro específica

### Estados de Processamento

- **Botão Desabilitado**: Durante o processamento
- **Texto Dinâmico**: "Processando..." quando em andamento
- **Prevenção**: Evita múltiplas chamadas simultâneas

### Compatibilidade

- **Histórico Local**: Mantém registro no localStorage para compatibilidade
- **Dados Mock**: Suporte para desenvolvimento sem API
- **Logs Detalhados**: Para debugging e monitoramento

## Métodos de Debug

### Console Logs
- Payload enviado para API
- Resposta da API
- Erros detalhados
- Estado de processamento

### Verificação de Dados
```typescript
// Verificar dados carregados
console.log('Categorias:', categories);
console.log('Itens:', items);
console.log('Recompensas mapeadas:', mappedRewards);
```

### Teste de Resgate
```typescript
// Simular resgate
const testPurchase = {
  item: "58b97dcee4b00e431b3135f7",
  player: "test@email.com",
  extra: {
    upgrade: "house"
  }
};
``` 