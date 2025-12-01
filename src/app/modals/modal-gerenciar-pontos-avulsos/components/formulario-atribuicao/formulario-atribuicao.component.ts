import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionTemplate } from '../../../../services/pontos-avulsos.service';

@Component({
  selector: 'app-formulario-atribuicao',
  templateUrl: './formulario-atribuicao.component.html',
  styleUrls: ['./formulario-atribuicao.component.scss']
})
export class FormularioAtribuicaoComponent implements OnInit {
  @Input() atividades: ActionTemplate[] = [];
  @Input() jogadores: any[] = [];
  @Input() loadingAtividades = false;
  @Input() loadingJogadores = false;
  @Input() processandoAtribuicao = false;
  @Input() isTeamContext = true;
  @Input() userName = '';
  @Input() aliases: any;
  @Output() submitForm = new EventEmitter<any>();

  formAtribuir: FormGroup;

  statusList = [
    { value: 'PENDING', label: 'Pendente' },
    { value: 'DOING', label: 'Em Execução' },
    { value: 'DONE', label: 'Aguardando Aprovação' },
    { value: 'DELIVERED', label: 'Aprovado' },
    { value: 'CANCELLED', label: 'Cancelada' }
  ];

  constructor(private fb: FormBuilder) {
    this.formAtribuir = this.fb.group({
      atividade: [null, Validators.required],
      jogador: [null, Validators.required], // Pode ser null, 'UNASSIGNED' ou um ID de jogador
      delivery_id: [null, Validators.required],
      delivery_title: [null, Validators.required],
      status: ['PENDING', Validators.required],
      dataFinalizacao: [null]
    });
  }

  ngOnInit() {
    // Configurar o espelhamento automático do título para o ID
    this.formAtribuir.get('delivery_title')?.valueChanges.subscribe(titulo => {
      if (titulo) {
        const idGerado = this.gerarIdFromTitulo(titulo);
        this.formAtribuir.patchValue({ delivery_id: idGerado }, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.formAtribuir.valid) {
      this.submitForm.emit(this.formAtribuir.value);
    }
  }

  limparFormulario() {
    this.formAtribuir.reset({ status: 'PENDING' });
  }

  preencherComDelivery(delivery: any) {
    const titulo = delivery.title || delivery.name || '';
    const id = delivery.id || '';

    this.formAtribuir.patchValue({
      delivery_title: titulo,
      delivery_id: id,
      status: 'PENDING'
    });

    if (titulo && !id) {
      const idGerado = this.gerarIdFromTitulo(titulo);
      this.formAtribuir.patchValue({ delivery_id: idGerado });
    }
  }

  private gerarIdFromTitulo(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
} 