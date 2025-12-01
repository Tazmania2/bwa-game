import { Component, Input } from '@angular/core';

/**
 * Component to display error messages with consistent styling
 * Supports different error types and optional retry functionality
 */
@Component({
  selector: 'c4u-error-message',
  templateUrl: './c4u-error-message.component.html',
  styleUrls: ['./c4u-error-message.component.scss']
})
export class C4uErrorMessageComponent {
  @Input() message: string = 'Ocorreu um erro. Tente novamente.';
  @Input() type: 'network' | 'auth' | 'notFound' | 'server' | 'generic' = 'generic';
  @Input() showRetry: boolean = true;
  @Input() retryCallback?: () => void;

  get errorIcon(): string {
    switch (this.type) {
      case 'network':
        return 'ri-wifi-off-line';
      case 'auth':
        return 'ri-lock-line';
      case 'notFound':
        return 'ri-search-line';
      case 'server':
        return 'ri-server-line';
      default:
        return 'ri-error-warning-line';
    }
  }

  get errorTitle(): string {
    switch (this.type) {
      case 'network':
        return 'Erro de Conexão';
      case 'auth':
        return 'Erro de Autenticação';
      case 'notFound':
        return 'Não Encontrado';
      case 'server':
        return 'Erro no Servidor';
      default:
        return 'Erro';
    }
  }

  onRetry(): void {
    if (this.retryCallback) {
      this.retryCallback();
    }
  }
}
