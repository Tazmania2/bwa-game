import { Detalhe } from "./detalhe.model";

export interface DetalheAtividade extends Detalhe {
    resultados: Array<{
        identificador?: string;
        nome?: string;
        dataAtribuicao?: Date;
        dataExecucao?: Date;
        dataFinalizacao?: Date;
    }>
}