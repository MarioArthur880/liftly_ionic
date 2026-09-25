export class HistoricoExercicioModel {
  id: string;
  exercicioId: string;
  catalogoId: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: number;
  carga: number;
  descansoSegundos: number;
  observacao: string;
  avulso: boolean;
  seriesFeitas: boolean[];

  constructor() {
    this.id = '';
    this.exercicioId = '';
    this.catalogoId = '';
    this.nome = '';
    this.grupoMuscular = '';
    this.series = 0;
    this.repeticoes = 0;
    this.carga = 0;
    this.descansoSegundos = 0;
    this.observacao = '';
    this.avulso = false;
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
