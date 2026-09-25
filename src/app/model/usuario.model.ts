export class UsuarioModel {
  id: string;
  nome: string;
  email: string;
  senha: string;
  peso: number | null;
  altura: number | null;
  dataNascimento: string;
  objetivo: string;
  ativo: boolean;

  constructor() {
    this.id = '';
    this.nome = '';
    this.email = '';
    this.senha = '';
    this.peso = null;
    this.altura = null;
    this.dataNascimento = '';
    this.objetivo = '';
    this.ativo = true;
  }
}

export interface AuthResponseModel {
  usuario: UsuarioModel;
  token: string;
}
