# AliasService

O `AliasService` é responsável por gerenciar os aliases dos parâmetros do sistema, fornecendo acesso tipado e centralizado aos textos personalizáveis e URLs de redirecionamento.

## Aliases Disponíveis

### 📝 Textos Personalizáveis
- **points_alias**: Alias para "Pontos"
- **coins_alias**: Alias para "Moedas" 
- **delivery_alias**: Alias para "Entregas"
- **action_alias**: Alias para "Ações"

### 🔗 URLs de Redirecionamento
- **user_action_redirect_url**: URL para redirecionamento de ações do usuário
- **delivery_redirect_url**: URL para redirecionamento de entregas

## Uso Básico

### 1. Inicialização

```typescript
import { AliasService } from './services/alias.service';

constructor(private aliasService: AliasService) {}

async ngOnInit() {
  await this.aliasService.loadAliases();
}
```

### 2. Acesso aos Aliases

```typescript
// Obter todos os aliases
const aliases = await this.aliasService.getAliases();

// Obter alias específico
const pointsAlias = await this.aliasService.getPointAlias();
const deliveryAlias = await this.aliasService.getDeliveryAlias();

// Obter URLs de redirecionamento
const userActionUrl = await this.aliasService.getUserActionRedirectUrl();
const deliveryUrl = await this.aliasService.getDeliveryRedirectUrl();
```

### 3. Uso no Template

```html
<!-- Usar alias de texto -->
<h3>{{ deliveryAlias }} Finalizadas</h3>
<p>Você tem {{ points }} {{ pointsAlias }}</p>

<!-- Usar URLs de redirecionamento -->
<a [href]="userActionRedirectUrl" *ngIf="userActionRedirectUrl">
  Ver Ações
</a>
<a [href]="deliveryRedirectUrl" *ngIf="deliveryRedirectUrl">
  Ver Entregas
</a>
```

## Métodos Disponíveis

### Aliases de Texto
- `getPointAlias()`: Retorna o alias para "Pontos"
- `getCoinsAlias()`: Retorna o alias para "Moedas"
- `getDeliveryAlias()`: Retorna o alias para "Entregas"
- `getActionAlias()`: Retorna o alias para "Ações"

### URLs de Redirecionamento
- `getUserActionRedirectUrl()`: Retorna a URL de redirecionamento para ações
- `getDeliveryRedirectUrl()`: Retorna a URL de redirecionamento para entregas

### Métodos Gerais
- `getAliases()`: Retorna todos os aliases
- `getAlias<K>(aliasType)`: Retorna um alias específico por tipo
- `isLoadingAliases()`: Verifica se está carregando
- `isAliasesLoaded()`: Verifica se já foi carregado
- `clearCache()`: Limpa o cache
- `reloadAliases()`: Recarrega os aliases

## Exemplo de Componente Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { AliasService, SystemAliases } from './services/alias.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <h2>📊 Dashboard</h2>
      
      <div class="stats">
        <div class="stat-card">
          <h3>{{ deliveryAlias }} Finalizadas</h3>
          <p>{{ completedDeliveries }}</p>
        </div>
        
        <div class="stat-card">
          <h3>{{ pointsAlias }} Ganhos</h3>
          <p>{{ totalPoints }}</p>
        </div>
      </div>
      
      <div class="actions" *ngIf="userActionRedirectUrl">
        <a [href]="userActionRedirectUrl" class="btn btn-primary">
          Ver {{ actionAlias }}
        </a>
      </div>
      
      <div class="deliveries" *ngIf="deliveryRedirectUrl">
        <a [href]="deliveryRedirectUrl" class="btn btn-secondary">
          Ver {{ deliveryAlias }}
        </a>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  aliases: SystemAliases | null = null;
  
  constructor(private aliasService: AliasService) {}

  async ngOnInit() {
    this.aliases = await this.aliasService.getAliases();
  }

  // Getters para facilitar o uso no template
  get pointsAlias(): string {
    return this.aliases?.pointAlias || 'Pontos';
  }

  get deliveryAlias(): string {
    return this.aliases?.deliveryAlias || 'Entregas';
  }

  get actionAlias(): string {
    return this.aliases?.actionAlias || 'Ações';
  }

  get userActionRedirectUrl(): string | null {
    return this.aliases?.userActionRedirectUrl || null;
  }

  get deliveryRedirectUrl(): string | null {
    return this.aliases?.deliveryRedirectUrl || null;
  }
}
```

## Integração com SystemInitService

O `AliasService` é automaticamente inicializado pelo `SystemInitService`:

```typescript
import { SystemInitService } from './services/system-init.service';

constructor(private systemInitService: SystemInitService) {}

async ngOnInit() {
  await this.systemInitService.initializeAll();
  // AliasService já estará inicializado
}
```

## Tratamento de Erros

O serviço inclui tratamento robusto de erros:

- Valores padrão são retornados em caso de falha na API
- URLs de redirecionamento podem ser `null` se não configuradas
- Logs de erro são exibidos no console
- Estados de carregamento são gerenciados adequadamente

## Valores Padrão

Em caso de erro ou parâmetros não encontrados, os seguintes valores são usados:

```typescript
{
  pointAlias: 'Pontos',
  coinsAlias: 'Moedas',
  deliveryAlias: 'Entregas',
  actionAlias: 'Ações',
  userActionRedirectUrl: null,
  deliveryRedirectUrl: null
}
```

## Casos de Uso das URLs de Redirecionamento

### user_action_redirect_url
- Redirecionamento para página de ações do usuário
- Links em dashboards e menus
- Botões de "Ver Minhas Ações"

### delivery_redirect_url
- Redirecionamento para página de entregas
- Links em relatórios de produtividade
- Botões de "Ver Entregas"

## Performance

- Cache em memória para evitar requisições desnecessárias
- Inicialização otimizada através do `SystemInitService`
- Carregamento assíncrono sem bloqueio da UI
- Reutilização de dados em toda a aplicação 