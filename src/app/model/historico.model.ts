export class HistoricoExercicioModel {
  exercicioId: string;
  nome: string;
  series: number;
  repeticoes: number;
  carga: number;
  observacao: string;
  // Uma entrada por série: true = feita, false = não feita
  seriesFeitas: boolean[];

  constructor() {
    this.exercicioId = '';
    this.nome = '';
    this.series = 0;
    this.repeticoes = 0;
    this.carga = 0;
    this.observacao = '';
    this.seriesFeitas = [];
  }
}

export class HistoricoModel {
  id: string;
  usuarioId: string;
  divisaoId: string;
  divisaoNome: string;
  dataInicio: string;
  dataFim: string;
  exercicios: HistoricoExercicioModel[];

  constructor() {
    this.id = '';
    this.usuarioId = '';
    this.divisaoId = '';
    this.divisaoNome = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.exercicios = [];
  }
}
