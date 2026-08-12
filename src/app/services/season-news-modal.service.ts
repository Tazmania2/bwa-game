import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalSeasonNewsComponent } from '@modals/modal-season-news/modal-season-news.component';

/** Marca o modal de novidades da Temporada 1 como pendente após login. */
const PENDING_KEY = 'season1_news_pending';

/** Impede reabertura do modal na mesma sessão após o usuário fechar. */
const DISMISSED_KEY = 'season1_news_dismissed';

@Injectable({
  providedIn: 'root',
})
export class SeasonNewsModalService {
  private isOpen = false;

  constructor(private ngbModal: NgbModal) {}

  /** Chamado no login bem-sucedido: o modal deve aparecer de novo nesta sessão. */
  markPendingAfterLogin(): void {
    try {
      sessionStorage.removeItem(DISMISSED_KEY);
      sessionStorage.setItem(PENDING_KEY, '1');
    } catch {
      // sessionStorage indisponível (modo privado restrito, etc.)
    }
  }

  /**
   * Abre o modal se houver login pendente e o usuário ainda não fechou nesta sessão.
   * Seguro para chamar em vários pontos: só abre uma vez.
   */
  tryShowAfterLogin(): void {
    if (this.isOpen || !this.shouldShow()) {
      return;
    }

    this.isOpen = true;

    try {
      const modalRef = this.ngbModal.open(ModalSeasonNewsComponent, {
        size: 'lg',
        scrollable: true,
      });

      modalRef.result.finally(() => {
        this.isOpen = false;
        this.markDismissed();
      });
    } catch (error) {
      this.isOpen = false;
      console.warn('Não foi possível abrir o modal de novidades da temporada:', error);
    }
  }

  private shouldShow(): boolean {
    try {
      if (sessionStorage.getItem(DISMISSED_KEY) === '1') {
        return false;
      }
      return sessionStorage.getItem(PENDING_KEY) === '1';
    } catch {
      return false;
    }
  }

  private markDismissed(): void {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      // ignore
    }
  }
}
