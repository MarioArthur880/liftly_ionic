export class GrupoModel {
  id: string;
  nome: string;
  codigoConvite: string;
  criadorId: string;
  totalMembros: number;

  constructor() {
    this.id = '';
    this.nome = '';
    this.codigoConvite = '';
    this.criadorId = '';
    this.totalMembros = 0;
  }
}

export class MembroRankingModel {
  usuarioId: string;
  nome: string;
  streakAtual: number;
  treinosNaSemana: number;

  constructor() {
    this.usuarioId = '';
    this.nome = '';
    this.streakAtual = 0;
    this.treinosNaSemana = 0;
  }
}

export class GrupoDetalheModel {
  id: string;
  nome: string;
  codigoConvite: string;
  ranking: MembroRankingModel[];

  constructor() {
    this.id = '';
    this.nome = '';
    this.codigoConvite = '';
    this.ranking = [];
  }
}

export class NovoGrupoModel {
  nome: string;
  criadorId: string;

  constructor() {
    this.nome = '';
    this.criadorId = '';
  }
}
