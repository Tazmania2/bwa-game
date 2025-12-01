import { Detalhe } from "./detalhe.model";

export interface DetalheMacro extends Detalhe {
    resultados: Array<{
        idMacroAtividade?: string;
        nomeMacroAtividade?: string;
        idContratoServico?: number;
        dataUltimaInicializacao?: Date;
        dataUltimaAtribuicao?: Date;
        dataUltimaFinalizacao?: Date;
    }>
}
