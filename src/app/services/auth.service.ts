import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponseModel, UsuarioModel } from '../model/usuario.model';
import { environment } from '../../environments/environment';

export const SESSAO_KEY = 'liftly_usuario';
export const TOKEN_KEY = 'liftly_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  autenticar(email: string, senha: string): Observable<AuthResponseModel> {
    return this.http.post<AuthResponseModel>(`${this.apiUrl}/auth/login`, { email, senha })
      .pipe(tap(resposta => this.salvarSessao(resposta.usuario, resposta.token)));
  }

  cadastrar(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.apiUrl}/auth/cadastro`, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha
    });
  }

  atualizarUsuario(usuarioAtualizado: UsuarioModel): Observable<UsuarioModel> {
    const corpo = {
      nome: usuarioAtualizado.nome,
      dataNascimento: usuarioAtualizado.dataNascimento || null,
      peso: usuarioAtualizado.peso,
      altura: usuarioAtualizado.altura,
      objetivo: usuarioAtualizado.objetivo || null
    };
    return this.http.put<UsuarioModel>(`${this.apiUrl}/auth/usuarios/${usuarioAtualizado.id}`, corpo)
      .pipe(tap(usuario => this.salvarUsuario(usuario)));
  }

  alterarSenha(id: string, senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/auth/usuarios/${id}/senha`, { senhaAtual, novaSenha });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {})
      .pipe(tap(() => this.limparSessao()));
  }

  desativarConta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/usuarios/${id}`)
      .pipe(tap(() => this.limparSessao()));
  }

  salvarSessao(usuario: UsuarioModel, token: string): void {
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  private salvarUsuario(usuario: UsuarioModel): void {
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
  }

  obterSessao(): UsuarioModel {
    const dados = sessionStorage.getItem(SESSAO_KEY);
    return dados ? JSON.parse(dados) : new UsuarioModel();
  }

  obterToken(): string {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  verificarSessao(): boolean {
    return !!sessionStorage.getItem(SESSAO_KEY) && !!sessionStorage.getItem(TOKEN_KEY);
  }

  limparSessao(): void {
    sessionStorage.removeItem(SESSAO_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
