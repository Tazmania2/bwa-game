# Debug da API de Campanha

Este documento explica como debugar problemas com a API `/campaign/current` e identificar o formato correto da resposta.

## Problema Comum

O erro "Resposta da API inválida" geralmente ocorre quando:

1. A API retorna um formato diferente do esperado
2. A API está indisponível ou retorna erro
3. Os campos obrigatórios estão ausentes na resposta

## Como Debugar

### 1. Usando o Console do Navegador

```typescript
// No console do navegador, execute:
import { CampaignService } from './services/campaign.service';

// Obter instância do serviço (se disponível globalmente)
const campaignService = window['campaignService'] || new CampaignService();

// Testar a API
await campaignService.debugApiResponse();
```

### 2. Usando o Componente de Debug

```typescript
// Adicione o componente de debug em qualquer página
<app-campaign-debug></app-campaign-debug>
```

### 3. Debug Manual no Código

```typescript
// Adicione este código temporariamente em qualquer componente
async debugCampaign() {
  try {
    console.log('🔍 Testando API /campaign/current...');
    
    const response = await this.apiProvider.get('/campaign/current');
    console.log('📡 Resposta bruta:', response);
    console.log('📊 Tipo:', typeof response);
    console.log('📋 É array?', Array.isArray(response));
    console.log('🔑 Chaves:', response ? Object.keys(response) : 'null');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}
```

## Formatos de Resposta Possíveis

### Formato 1: Resposta Direta
```json
{
  "id": 1,
  "created_at": "2024-05-01T12:00:00.000Z",
  "name": "Temporada de Maio",
  "client_id": "cidadania4u",
  "starts_at": "2024-05-01",
  "finishes_at": "2024-05-31"
}
```

### Formato 2: Envolvido em data
```json
{
  "data": {
    "id": 1,
    "created_at": "2024-05-01T12:00:00.000Z",
    "name": "Temporada de Maio",
    "client_id": "cidadania4u",
    "starts_at": "2024-05-01",
    "finishes_at": "2024-05-31"
  }
}
```

### Formato 3: Array
```json
[
  {
    "id": 1,
    "created_at": "2024-05-01T12:00:00.000Z",
    "name": "Temporada de Maio",
    "client_id": "cidadania4u",
    "starts_at": "2024-05-01",
    "finishes_at": "2024-05-31"
  }
]
```

### Formato 4: Com metadados
```json
{
  "success": true,
  "data": {
    "id": 1,
    "created_at": "2024-05-01T12:00:00.000Z",
    "name": "Temporada de Maio",
    "client_id": "cidadania4u",
    "starts_at": "2024-05-01",
    "finishes_at": "2024-05-31"
  },
  "message": "Campanha encontrada"
}
```

## Soluções Comuns

### 1. API Retorna Array
Se a API retorna um array em vez de um objeto:

```typescript
// O código já trata isso automaticamente
if (Array.isArray(response) && response.length > 0) {
  campaignData = response[0];
}
```

### 2. API Retorna com data
Se a API envolve a resposta em um campo `data`:

```typescript
// O código já trata isso automaticamente
if (response && response.data) {
  campaignData = response.data;
}
```

### 3. Campos com Nomes Diferentes
Se os campos têm nomes diferentes:

```typescript
// Exemplo: start_date em vez de starts_at
const campaign: Campaign = {
  id: campaignData.id,
  created_at: campaignData.created_at || campaignData.createdAt,
  name: campaignData.name || campaignData.campaign_name,
  client_id: campaignData.client_id || campaignData.clientId,
  starts_at: campaignData.starts_at || campaignData.start_date,
  finishes_at: campaignData.finishes_at || campaignData.end_date
};
```

### 4. API Indisponível
Se a API não está respondendo:

```typescript
// O serviço retorna uma campanha padrão automaticamente
return this.getDefaultCampaign();
```

## Logs de Debug

### Logs de Sucesso
```
🔍 Testando conectividade da API /campaign/current...
📡 Resposta bruta da API: { id: 1, name: "Temporada de Maio", ... }
📊 Tipo da resposta: object
📋 É array? false
🔑 Chaves da resposta: ["id", "created_at", "name", "client_id", "starts_at", "finishes_at"]
✅ Resposta direta com ID encontrado
🏆 Campanha atual carregada: { id: 1, name: "Temporada de Maio", ... }
```

### Logs de Erro
```
❌ Erro ao carregar campanha atual: Error: Formato de resposta não reconhecido
📋 Detalhes do erro: {
  message: "Formato de resposta não reconhecido",
  stack: "Error: Formato de resposta não reconhecido..."
}
```

## Testando a API Manualmente

### Usando cURL
```bash
curl -X GET "https://sua-api.com/campaign/current" \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json"
```

### Usando Postman
1. Método: GET
2. URL: `https://sua-api.com/campaign/current`
3. Headers: Authorization, Content-Type
4. Execute e verifique a resposta

### Usando Fetch no Console
```javascript
fetch('/campaign/current', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer seu-token',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('Resposta:', data))
.catch(error => console.error('Erro:', error));
```

## Ajustando o Código

Se você identificar um formato específico, pode ajustar o `CampaignService`:

```typescript
private async fetchCurrentCampaign(): Promise<Campaign> {
  try {
    const response: any = await this.apiProvider.get('/campaign/current');
    
    // Adicione logs específicos para seu caso
    console.log('Resposta específica:', response);
    
    // Ajuste a lógica baseada no formato real
    let campaignData: any = null;
    
    // Seu formato específico aqui...
    
  } catch (error) {
    console.error('Erro:', error);
    return this.getDefaultCampaign();
  }
}
```

## Fallback Seguro

O serviço sempre tem um fallback seguro:

```typescript
// Em caso de erro, retorna campanha padrão
return {
  id: 1,
  created_at: new Date().toISOString(),
  name: 'Temporada Padrão',
  client_id: 'default',
  starts_at: '2024-05-01',  // Primeiro dia do mês atual
  finishes_at: '2024-05-31' // Último dia do mês atual
};
```

Isso garante que a aplicação continue funcionando mesmo se a API estiver indisponível. 