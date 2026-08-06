import { Injectable } from '@angular/core';
import { UsuarioModel } from '../model/usuario.model';

const SESSAO_KEY = 'liftly_usuario';
const USUARIOS_KEY = 'liftly_usuarios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  autenticar(email: string, senha: string): UsuarioModel | null {
    const usuarios: UsuarioModel[] = this.listarUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha && u.ativo !== false);
    return usuario ?? null;
  }

  cadastrar(usuario: UsuarioModel): boolean {
    const usuarios: UsuarioModel[] = this.listarUsuarios();
    const existe = usuarios.find(u => u.email === usuario.email);
    if (existe) return false;
    usuario.id = this.gerarId();
    usuario.ativo = true;
    usuarios.push(usuario);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    return true;
  }

  atualizarUsuario(usuarioAtualizado: UsuarioModel): void {
    const usuarios: UsuarioModel[] = this.listarUsuarios();
    const index = usuarios.findIndex(u => u.id === usuarioAtualizado.id);
    if (index !== -1) {
      usuarios[index] = usuarioAtualizado;
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    }
    this.salvarSessao(usuarioAtualizado);
  }

  desativarConta(id: string): void {
    const usuarios: UsuarioModel[] = this.listarUsuarios();
    const index = usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
      usuarios[index].ativo = false;
      localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    }
    this.limparSessao();
  }

  salvarSessao(usuario: UsuarioModel): void {
    localStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
  }

  obterSessao(): UsuarioModel {
    const dados = localStorage.getItem(SESSAO_KEY);
    return dados ? JSON.parse(dados) : new UsuarioModel();
  }

  verificarSessao(): boolean {
    const dados = localStorage.getItem(SESSAO_KEY);
    return !!dados;
  }

  limparSessao(): void {
    localStorage.removeItem(SESSAO_KEY);
  }

  private listarUsuarios(): UsuarioModel[] {
    const dados = localStorage.getItem(USUARIOS_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  private gerarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
