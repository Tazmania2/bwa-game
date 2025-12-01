# FeaturesService

O `FeaturesService` é responsável por gerenciar as funcionalidades do sistema baseadas nos parâmetros do endpoint `/client/system-params`. Este serviço permite controlar dinamicamente quais recursos estão habilitados ou desabilitados no sistema.

## Funcionalidades Gerenciadas

### 🎮 Gamification
- **enable_achievements**: Sistema de conquistas
- **enable_leaderboards**: Rankings e classificações
- **enable_challenges**: Sistema de desafios

### 👥 Social & Store
- **enable_social_features**: Funcionalidades sociais
- **enable_virtual_store**: Loja virtual

### 📝 Content & UI
- **enable_update_notes**: Notas de atualização
- **enable_mascot**: Mascote do sistema
- **mascot_img_url**: URL da imagem da mascote

### 🌐 Language & Theme
- **language_multilingual**: Suporte a múltiplos idiomas
- **default_language**: Idioma padrão do sistema
- **allow_theme_switch**: Permite troca de tema
- **default_theme**: Tema padrão do sistema

## Uso Básico

### 1. Inicialização

```typescript
import { FeaturesService } from './services/features.service';

constructor(private featuresService: FeaturesService) {}

async ngOnInit() {
  await this.featuresService.initializeFeatures();
}
```

### 2. Verificação de Funcionalidades

```typescript
// Verificar se uma funcionalidade está habilitada
if (this.featuresService.isAchievementsEnabled()) {
  // Mostrar seção de achievements
}

// Verificar múltiplas funcionalidades
if (this.featuresService.isLeaderboardsEnabled() && 
    this.featuresService.isChallengesEnabled()) {
  // Mostrar dashboard de gamificação
}
```

### 3. Renderização Condicional no Template

```html
<!-- Mostrar apenas se achievements estiverem habilitados -->
<div *ngIf="featuresService.isAchievementsEnabled()">
  <h3>🏆 Conquistas</h3>
  <!-- Conteúdo dos achievements -->
</div>

<!-- Mostrar mascote se habilitada -->
<div *ngIf="featuresService.isMascotEnabled()">
  <img [src]="featuresService.getMascotImageUrl()" alt="Mascote" />
</div>

<!-- Mostrar seletor de idioma apenas se multilíngue -->
<div *ngIf="featuresService.isMultilingual()">
  <select>
    <option value="pt-br">Português</option>
    <option value="en-us">English</option>
  </select>
</div>
```

## Métodos Disponíveis

### Verificação de Status
- `isUpdateNotesEnabled()`: Notas de atualização
- `isMascotEnabled()`: Mascote
- `isAchievementsEnabled()`: Achievements
- `isLeaderboardsEnabled()`: Leaderboards
- `isChallengesEnabled()`: Desafios
- `isSocialFeaturesEnabled()`: Funcionalidades sociais
- `isVirtualStoreEnabled()`: Loja virtual
- `isMultilingual()`: Sistema multilíngue
- `isThemeSwitchAllowed()`: Troca de tema permitida

### Obtenção de Valores
- `getMascotImageUrl()`: URL da imagem da mascote
- `getDefaultLanguage()`: Idioma padrão
- `getDefaultTheme()`: Tema padrão

### Estado do Serviço
- `isLoading()`: Verifica se está carregando
- `getFeatures()`: Obtém todas as funcionalidades
- `getFeaturesObservable()`: Observable das funcionalidades

## Integração com SystemInitService

O `FeaturesService` é automaticamente inicializado pelo `SystemInitService`:

```typescript
import { SystemInitService } from './services/system-init.service';

constructor(private systemInitService: SystemInitService) {}

async ngOnInit() {
  await this.systemInitService.initializeAll();
  // FeaturesService já estará inicializado
}
```

## Exemplo de Componente Completo

```typescript
import { Component, OnInit } from '@angular/core';
import { FeaturesService } from './services/features.service';

@Component({
  selector: 'app-gamification-dashboard',
  template: `
    <div class="dashboard">
      <h2>🎮 Dashboard de Gamificação</h2>
      
      <div *ngIf="featuresService.isAchievementsEnabled()" class="section">
        <h3>🏆 Conquistas</h3>
        <!-- Conteúdo dos achievements -->
      </div>
      
      <div *ngIf="featuresService.isLeaderboardsEnabled()" class="section">
        <h3>📊 Rankings</h3>
        <!-- Conteúdo dos leaderboards -->
      </div>
      
      <div *ngIf="featuresService.isChallengesEnabled()" class="section">
        <h3>🎯 Desafios</h3>
        <!-- Conteúdo dos desafios -->
      </div>
      
      <div *ngIf="!hasAnyGamificationFeature()" class="no-features">
        <p>Nenhuma funcionalidade de gamificação habilitada</p>
      </div>
    </div>
  `
})
export class GamificationDashboardComponent implements OnInit {
  constructor(public featuresService: FeaturesService) {}

  ngOnInit() {
    // FeaturesService já inicializado pelo SystemInitService
  }

  hasAnyGamificationFeature(): boolean {
    return this.featuresService.isAchievementsEnabled() ||
           this.featuresService.isLeaderboardsEnabled() ||
           this.featuresService.isChallengesEnabled();
  }
}
```

## Tratamento de Erros

O serviço inclui tratamento robusto de erros:

- Valores padrão são retornados em caso de falha na API
- Logs de erro são exibidos no console
- Estados de carregamento são gerenciados adequadamente

## Valores Padrão

Em caso de erro ou parâmetros não encontrados, os seguintes valores são usados:

```typescript
{
  enableUpdateNotes: false,
  enableMascot: false,
  mascotImgUrl: null,
  enableAchievements: false,
  enableLeaderboards: false,
  enableChallenges: false,
  enableSocialFeatures: false,
  enableVirtualStore: false,
  languageMultilingual: false,
  defaultLanguage: 'pt-br',
  allowThemeSwitch: false,
  defaultTheme: 'dark'
}
```

## Performance

- Cache em memória para evitar requisições desnecessárias
- Inicialização otimizada através do `SystemInitService`
- Observables para reatividade eficiente
- Carregamento assíncrono sem bloqueio da UI 