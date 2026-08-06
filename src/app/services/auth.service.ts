import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UsuarioModel } from '../model/usuario.model';
import { environment } from '../../environments/environment';

const SESSAO_KEY = 'liftly_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  autenticar(email: string, senha: string): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.apiUrl}/auth/login`, { email, senha })
      .pipe(tap(usuario => this.salvarSessao(usuario)));
  }

  cadastrar(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.apiUrl}/auth/cadastro`, usuario);
  }

  atualizarUsuario(usuarioAtualizado: UsuarioModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.apiUrl}/auth/usuarios/${usuarioAtualizado.id}`, usuarioAtualizado)
      .pipe(tap(usuario => this.salvarSessao(usuario)));
  }


  alterarSenha(id: string, senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/auth/usuarios/${id}/senha`, {
      senhaAtual,
      novaSenha
    });
  }

  desativarConta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auth/usuarios/${id}`)
      .pipe(tap(() => this.limparSessao()));
  }

  salvarSessao(usuario: UsuarioModel): void {
    sessionStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
  }

  obterSessao(): UsuarioModel {
    const dados = sessionStorage.getItem(SESSAO_KEY);
    return dados ? JSON.parse(dados) : new UsuarioModel();
  }

  verificarSessao(): boolean {
    return !!sessionStorage.getItem(SESSAO_KEY);
  }

  limparSessao(): void {
    sessionStorage.removeItem(SESSAO_KEY);
  }
}
