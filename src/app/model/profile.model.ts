import { TipoAcesso } from "@providers/sessao/sessao.provider";

export interface ProfileProps {
    _id: string;
    nome: string;
    identificador: TipoAcesso;
}