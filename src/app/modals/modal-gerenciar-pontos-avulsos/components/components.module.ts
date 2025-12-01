import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Componentes
import { TipoSelecaoComponent } from './tipo-selecao/tipo-selecao.component';
import { AbaNavegacaoComponent } from './aba-navegacao/aba-navegacao.component';
import { FormularioAtribuicaoComponent } from './formulario-atribuicao/formulario-atribuicao.component';
import { ListaAtividadesComponent } from './lista-atividades/lista-atividades.component';
import { ListaProcessosComponent } from './lista-processos/lista-processos.component';
import { DetalheAtividadeComponent } from './detalhe-atividade/detalhe-atividade.component';
import { DetalheDeliveryComponent } from './detalhe-delivery/detalhe-delivery.component';
import { UploadAnexosComponent } from './upload-anexos/upload-anexos.component';
import { ComentariosComponent } from './comentarios/comentarios.component';

// Módulos externos
import { C4uBotaoSelecaoModule } from '../../../components/c4u-botao-selecao/c4u-botao-selecao.module';

@NgModule({
  declarations: [
    TipoSelecaoComponent,
    AbaNavegacaoComponent,
    FormularioAtribuicaoComponent,
    ListaAtividadesComponent,
    ListaProcessosComponent,
    DetalheAtividadeComponent,
    DetalheDeliveryComponent,
    UploadAnexosComponent,
    ComentariosComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    C4uBotaoSelecaoModule
  ],
  exports: [
    TipoSelecaoComponent,
    AbaNavegacaoComponent,
    FormularioAtribuicaoComponent,
    ListaAtividadesComponent,
    ListaProcessosComponent,
    DetalheAtividadeComponent,
    DetalheDeliveryComponent,
    UploadAnexosComponent,
    ComentariosComponent
  ]
})
export class ComponentsModule { } 