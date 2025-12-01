import { Component, Input } from '@angular/core';

@Component({
  selector: 'modal-detalhe-atividade',
  template: `
    <div class="modal-container">
      <div class="modal-header">
        <button class="back-btn" type="button" (click)="voltar()">&larr; Voltar</button>
        <h2>Detalhe da Atividade</h2>
      </div>
      <div class="empty-state">
        <p>Nenhum detalhe disponível para esta atividade.</p>
      </div>
    </div>
  `,
  styles: [`
    .modal-container { background: #23242a; color: #fff; border-radius: 12px; padding: 24px; min-width: 350px; max-width: 500px; box-shadow: 0 4px 32px rgba(0,0,0,0.4); }
    .modal-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .back-btn { background: none; border: none; color: #fff; font-size: 1rem; cursor: pointer; margin-right: 16px; }
    .empty-state { text-align: center; margin-top: 40px; color: #aaa; }
  `]
})
export class ModalDetalheAtividadeComponent {
  @Input() atividade: any;
  @Input() voltar: () => void = () => {};
} 