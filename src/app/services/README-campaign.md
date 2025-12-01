# CampaignService

O `CampaignService` é responsável por gerenciar os dados da campanha atual do sistema, obtendo informações do endpoint `/campaign/current`. Este serviço fornece acesso às datas de início e fim da temporada, além de informações da campanha como nome e ID.

## Estrutura da Campanha

### Interface Campaign
```typescript
export interface Campaign {
  id: number;           // ID único da campanha
  created_at: string;   // Data de criação da campanha
  name: string;         // Nome da campanha (ex: "Temporada de Maio")
  client_id: string;    // ID do cliente
  starts_at: string;    // Data de início (YYYY-MM-DD)
  finishes_at: string;  // Data de fim (YYYY-MM-DD)
}
```

### Exemplo de Resposta da API
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

## Uso Básico

### 1. Inicialização

```typescript
import { CampaignService } from './services/campaign.service';

constructor(private campaignService: CampaignService) {}

async ngOnInit() {
  await this.campaignService.getCurrentCampaign();
}
```

### 2. Acesso aos Dados da Campanha

```typescript
// Obter campanha completa
const campaign = await this.campaignService.getCurrentCampaign();

// Obter dados específicos
const startDate = await this.campaignService.getCampaignStartDate();
const endDate = await this.campaignService.getCampaignEndDate();
const name = await this.campaignService.getCampaignName();
const id = await this.campaignService.getCampaignId();
```

### 3. Uso no Template

```html
<div *ngIf="campaign">
  <h2>{{ campaign.name }}</h2>
  <p>Início: {{ campaign.starts_at | date:'dd/MM/yyyy' }}</p>
  <p>Fim: {{ campaign.finishes_at | date:'dd/MM/yyyy' }}</p>
</div>
```

## Métodos Disponíveis

### Dados da Campanha
- `getCurrentCampaign()`: Retorna todos os dados da campanha
- `getCampaignStartDate()`: Retorna a data de início como Date
- `getCampaignEndDate()`: Retorna a data de fim como Date
- `getCampaignName()`: Retorna o nome da campanha
- `getCampaignId()`: Retorna o ID da campanha

### Estado do Serviço
- `isLoadingCampaign()`: Verifica se está carregando
- `isCampaignLoaded()`: Verifica se já foi carregado
- `clearCache()`: Limpa o cache
- `reloadCampaign()`: Recarrega os dados

## Integração com SeasonDatesService

O `CampaignService` é usado pelo `SeasonDatesService` para fornecer as datas da temporada:

```typescript
// SeasonDatesService agora usa CampaignService
public async getSeasonStartDate(): Promise<Date> {
  return this.campaignService.getCampaignStartDate();
}

public async getSeasonEndDate(): Promise<Date> {
  return this.campaignService.getCampaignEndDate();
}
```

## Exemplo de Componente Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { CampaignService, Campaign } from './services/campaign.service';

@Component({
  selector: 'app-campaign-info',
  template: `
    <div class="campaign-info">
      <div *ngIf="isLoading" class="loading">
        <c4u-spinner></c4u-spinner>
        <p>Carregando campanha...</p>
      </div>
      
      <div *ngIf="!isLoading && campaign" class="campaign-details">
        <h2>🏆 {{ campaign.name }}</h2>
        
        <div class="campaign-dates">
          <div class="date-item">
            <span class="label">Início:</span>
            <span class="value">{{ campaign.starts_at | date:'dd/MM/yyyy' }}</span>
          </div>
          
          <div class="date-item">
            <span class="label">Fim:</span>
            <span class="value">{{ campaign.finishes_at | date:'dd/MM/yyyy' }}</span>
          </div>
        </div>
        
        <div class="campaign-meta">
          <p>ID da Campanha: {{ campaign.id }}</p>
          <p>Cliente: {{ campaign.client_id }}</p>
        </div>
      </div>
      
      <div *ngIf="!isLoading && !campaign" class="no-campaign">
        <p>❌ Nenhuma campanha disponível</p>
      </div>
    </div>
  `
})
export class CampaignInfoComponent implements OnInit {
  campaign: Campaign | null = null;
  isLoading = false;

  constructor(private campaignService: CampaignService) {}

  async ngOnInit() {
    this.isLoading = true;
    
    try {
      this.campaign = await this.campaignService.getCurrentCampaign();
    } catch (error) {
      console.error('Erro ao carregar campanha:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
```

## Integração com SystemInitService

O `CampaignService` é automaticamente inicializado pelo `SystemInitService`:

```typescript
import { SystemInitService } from './services/system-init.service';

constructor(private systemInitService: SystemInitService) {}

async ngOnInit() {
  await this.systemInitService.initializeAll();
  // CampaignService já estará inicializado
}
```

## Tratamento de Erros

O serviço inclui tratamento robusto de erros:

- Campanha padrão é retornada em caso de falha na API
- Logs de erro são exibidos no console
- Estados de carregamento são gerenciados adequadamente
- Cache evita requisições desnecessárias

## Campanha Padrão

Em caso de erro ou API indisponível, uma campanha padrão é criada:

```typescript
{
  id: 1,
  created_at: "2024-05-01T00:00:00.000Z",
  name: "Temporada Padrão",
  client_id: "default",
  starts_at: "2024-05-01",  // Primeiro dia do mês atual
  finishes_at: "2024-05-31" // Último dia do mês atual
}
```

## Performance

- Cache em memória para evitar requisições desnecessárias
- Inicialização otimizada através do `SystemInitService`
- Carregamento assíncrono sem bloqueio da UI
- Reutilização de dados em toda a aplicação

## Migração do Sistema Anterior

### Antes (SystemParams)
```typescript
// Usava season_start_date e season_end_date dos system params
const startDate = await this.systemParamsService.getParam<string>('season_start_date');
const endDate = await this.systemParamsService.getParam<string>('season_end_date');
```

### Depois (CampaignService)
```typescript
// Usa dados da campanha atual
const campaign = await this.campaignService.getCurrentCampaign();
const startDate = campaign.starts_at;
const endDate = campaign.finishes_at;
```

## Benefícios da Nova Abordagem

1. **Dados Centralizados**: Todas as informações da temporada em um local
2. **Flexibilidade**: Suporte a múltiplas campanhas
3. **Rastreabilidade**: ID e nome da campanha para auditoria
4. **Consistência**: Mesmo endpoint para todas as aplicações
5. **Manutenibilidade**: Código mais limpo e organizado 