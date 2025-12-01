# URLs de Redirecionamento

O sistema suporta URLs de redirecionamento configuráveis pelo administrador, permitindo links dinâmicos para ações do usuário e entregas.

## Configuração pelo Administrador

### Formato das URLs
As URLs devem ser configuradas no sistema com o placeholder `$(id)` que será substituído pelo ID real do item:

```
Exemplo: https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/$(id)/
```

### Parâmetros Configuráveis
- **user_action_redirect_url**: URL para redirecionamento de ações do usuário
- **delivery_redirect_url**: URL para redirecionamento de entregas

## Funcionamento

### 1. Substituição de Placeholder
O sistema automaticamente substitui `$(id)` pelo ID real:
- Para ações do usuário: usa `integration_id` ou `delivery_id`
- Para entregas: usa `id`

### 2. Validação de URL
- URLs são validadas antes do uso
- URLs inválidas retornam string vazia
- Logs de erro são exibidos no console

### 3. Tratamento de Erros
- URLs não configuradas não geram links clicáveis
- Links desabilitados são estilizados visualmente
- Tooltips informam quando URLs não estão configuradas

## Exemplos de Uso

### Configuração no Sistema
```json
{
  "user_action_redirect_url": "https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/$(id)/",
  "delivery_redirect_url": "https://alldax.bitrix24.com.br/workgroups/group/1536/crm/deal/details/$(id)/"
}
```

### Resultado da Substituição
```
URL Original: https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/$(id)/
ID Real: 12345
URL Final: https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/12345/
```

## Implementação no Código

### Componente TypeScript
```typescript
export class ModalPendingQuestsComponent {
  
  /**
   * Gera URL de redirecionamento para ações do usuário
   */
  userActionRedirectUrl(integrationId: string | number): string {
    const baseUrl = this.aliases?.userActionRedirectUrl;
    if (!baseUrl || !integrationId) {
      return '';
    }
    return this.replaceUrlPlaceholder(baseUrl, integrationId);
  }

  /**
   * Gera URL de redirecionamento para entregas
   */
  deliveryRedirectUrl(deliveryId: string | number): string {
    const baseUrl = this.aliases?.deliveryRedirectUrl;
    if (!baseUrl || !deliveryId) {
      return '';
    }
    return this.replaceUrlPlaceholder(baseUrl, deliveryId);
  }

  /**
   * Substitui placeholder $(id) pelo ID real
   */
  private replaceUrlPlaceholder(url: string, id: string | number): string {
    const cleanUrl = url.trim();
    const formattedUrl = cleanUrl.replace(/\$\(id\)/g, id.toString());
    
    if (this.isValidUrl(formattedUrl)) {
      return formattedUrl;
    } else {
      console.warn('URL de redirecionamento inválida:', formattedUrl);
      return '';
    }
  }
}
```

### Template HTML
```html
<a (click)="openDetailLink(modalData.typeSelected === 0 
  ? userActionRedirectUrl(dt.integration_id || dt.delivery_id)
  : deliveryRedirectUrl(dt.id))"
   [class.disabled-link]="!getRedirectUrl(modalData.typeSelected === 0, dt)"
   [title]="getRedirectUrl(modalData.typeSelected === 0, dt) ? 'Clique para abrir' : 'URL não configurada'"
>
  {{ modalData.typeSelected === 0 ? (dt.integration_id || dt.delivery_id || 'n/a') : dt.id }}
</a>
```

## Casos de Uso

### 1. Links para Tarefas (Bitrix24)
```
URL: https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/$(id)/
Uso: Redirecionamento para visualizar tarefas específicas
```

### 2. Links para Deals (CRM)
```
URL: https://alldax.bitrix24.com.br/workgroups/group/1536/crm/deal/details/$(id)/
Uso: Redirecionamento para visualizar deals específicos
```

### 3. Links para Leads
```
URL: https://alldax.bitrix24.com.br/workgroups/group/1536/crm/lead/details/$(id)/
Uso: Redirecionamento para visualizar leads específicos
```

## Validação e Segurança

### Validação de URL
- URLs absolutas são validadas com `new URL()`
- URLs relativas são aceitas se começarem com `/`, `./` ou `../`
- URLs inválidas retornam string vazia

### Tratamento de Erros
- URLs malformadas são logadas no console
- Links inválidos não são clicáveis
- Interface visual indica quando URLs não estão configuradas

### Limpeza de Dados
- Espaços em branco são removidos
- IDs são convertidos para string
- Caracteres especiais são tratados adequadamente

## Estilos CSS

### Link Desabilitado
```scss
.disabled-link {
  color: #999 !important;
  cursor: not-allowed !important;
  text-decoration: none !important;
  pointer-events: none !important;
  
  &:hover {
    color: #999 !important;
    text-decoration: none !important;
  }
}
```

## Logs e Debugging

### Logs de Sucesso
```
Aliases carregados: {
  userActionRedirectUrl: "https://alldax.bitrix24.com.br/workgroups/group/1536/tasks/task/view/$(id)/",
  deliveryRedirectUrl: "https://alldax.bitrix24.com.br/workgroups/group/1536/crm/deal/details/$(id)/"
}
```

### Logs de Erro
```
URL de redirecionamento inválida: https://invalid-url.com/task/$(id)/
Erro ao formatar URL de redirecionamento: Error message
```

## Boas Práticas

### 1. Configuração
- Sempre use HTTPS para URLs externas
- Teste as URLs antes de configurar
- Use URLs absolutas quando possível

### 2. Placeholders
- Use apenas `$(id)` como placeholder
- Não use outros placeholders sem implementação
- Mantenha o placeholder simples e claro

### 3. Validação
- Configure URLs válidas no sistema
- Monitore logs de erro
- Teste redirecionamentos regularmente

### 4. UX
- Links desabilitados devem ser visualmente distintos
- Tooltips informativos melhoram a experiência
- Fallbacks para URLs não configuradas 