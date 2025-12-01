interface AtividadeExecutorExtrato {
  idApp: number,
  nome: string,
  quantidade: number,
  peso: number,
  moedas: number,
  dataPrimeiraExecucao: Date,
  dataUltimaFinalizacao: Date
};


export interface ExecutorExtrato {
  idApp: number,
  nome: string,
  idAppTime: number,
  nomeTime: string,
  qtdeTotalAtividades: number,
  qtdeTotalMoedas: number,
  atividades: Array<AtividadeExecutorExtrato>,
  isAtivo: Boolean,
  isGestorLider: Boolean,
  dataPrimeiraAtividade: Date,
  dataUltimaAtividade: Date,
  nivel: number
}

export interface DetalheExtratoColaborador {
  executores: Array<ExecutorExtrato>,
  cotacao: { cotacao: number },
}
