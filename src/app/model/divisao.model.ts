export class ExercicioModel {
  id: string;
  catalogoId: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: number;
  carga: number;
  descansoSegundos: number;
  observacao: string;

  constructor() {
    this.id = '';
    this.catalogoId = '';
    this.nome = '';
    this.grupoMuscular = '';
    this.series = 3;
    this.repeticoes = 10;
    this.carga = 0;
    this.descansoSegundos = 0;
    this.observacao = '';
  }
}

export class DivisaoModel {
  id: string;
  usuarioId: string;
  nome: string;
  descricao: string;
  exercicios: ExercicioModel[];
  dataCriacao: string;

  constructor() {
    this.id = '';
    this.usuarioId = '';
    this.nome = '';
    this.descricao = '';
    this.exercicios = [];
    this.dataCriacao = new Date().toISOString();
  }
}
