import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DetalheAtividade} from "../model/detalheAtividade.model";
import {PainelInfoModel} from "../components/c4u-painel-info/c4u-painel-info.component";
import {translate} from "./translate.provider";
import {
    ModalData,
    ModalPendingQuestsComponent,
    SectionDetailModalData,
    TypeModalData
} from "../modals/modal-pending-quests/modal-pending-quests.component";
import {TabBarItemModel} from "../components/c4u-tabbar/c4u-tabbar.component";
import {DetalheMacro} from "../model/detalheMacro.model";
import {formatDate} from "@angular/common";


@Injectable({
    providedIn: 'root'
})
export class ModalDetailsPainelInfoProvider {

    constructor(private modal: NgbModal,
                @Inject(LOCALE_ID) private locale: string) {
    }

    public abreModal(modalData: ModalData) {
        let modal = this.modal.open(ModalPendingQuestsComponent);
        modal.componentInstance.data = modalData;
    }

    public infoToTypes(btnText: string, infos: Array<PainelInfoModel>): TypeModalData {
        return {
            btn: {text: btnText},
            tabItens: infos.filter(info => info.extras.showModal).map(info => {
                return {
                    tabBarItem: <TabBarItemModel>{name: info.text, icon: info.icon},
                    title: info.toolTip,
                    dataApi: async (page: number, pageSize: number, previousResults?: Array<any>) => {
                        let response = await info.extras.dataApi(page, pageSize);
                        // let results = previousResults ?? [];
                        // results = results.concat(detalhes);

                        //TODO Paginar consultas do game action
                        return {
                            // hasNext: detalhes.hasProxima,
                            // page: detalhes.paginaAtual,
                            // pageSize: detalhes.tamanhoPagina,
                            // total: detalhes.totalResultados,
                            // results: results,
                            sections: [{
                                title: "Resultados",
                                details: response
                            }]
                        }
                    }
                }
            })
        }
    }

    public getDetailsQuests(detalhes: DetalheAtividade, info: PainelInfoModel): Array<SectionDetailModalData> {
        if (detalhes && detalhes.totalResultados && detalhes.totalResultados > 0) {
            return [{
                details: detalhes.resultados.map(res => {
                        let dadoParam: any = res[<"dataAtribuicao" | "dataExecucao" | "dataFinalizacao">info.extras.textoItem.param];
                        let param = <any>{};
                        if (dadoParam) {
                            dadoParam = formatDate(dadoParam, "dd/MM/yyyy", this.locale);
                            param.date = dadoParam;
                        }

                        return {
                            id: res.identificador,
                            name: res.nome,
                            text: translate(info.extras.textoItem.label, param)
                        }
                    }
                )
            }]
        } else {
            return [{}];
        }
    }

    public getDetailsMacros(detalhes: DetalheMacro, info: PainelInfoModel): Array<SectionDetailModalData> {
        if (detalhes && detalhes.totalResultados && detalhes.totalResultados > 0) {
            return [{
                details: detalhes.resultados.map(res => {
                        let dadoParam: any = res[<"dataUltimaInicializacao" | "dataUltimaAtribuicao" | "dataUltimaFinalizacao">info.extras.textoItem.param];
                        let param = <any>{};
                        if (dadoParam) {
                            dadoParam = formatDate(dadoParam, "dd/MM/yyyy", this.locale);
                            param.date = dadoParam;
                        }

                        return {
                            id: "#" + res.idContratoServico,
                            url: "https://app.cidadania4u.com.br/#/empresa/contrato/" + res.idContratoServico,
                            name: res.nomeMacroAtividade,
                            text: translate(info.extras.textoItem.label, param)
                        }
                    }
                )
            }]
        } else {
            return [{}];
        }
    }


}
