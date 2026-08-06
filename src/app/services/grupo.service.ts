import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoModel, GrupoDetalheModel, NovoGrupoModel } from '../model/grupo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class GrupoService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<GrupoModel[]> {
    return this.http.get<GrupoModel[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  buscarDetalhe(id: string): Observable<GrupoDetalheModel> {
    return this.http.get<GrupoDetalheModel>(`${this.apiUrl}/${id}`);
  }

  criar(grupo: NovoGrupoModel): Observable<GrupoModel> {
    return this.http.post<GrupoModel>(this.apiUrl, grupo);
  }

  entrarPorCodigo(codigo: string, usuarioId: string): Observable<GrupoModel> {
    return this.http.post<GrupoModel>(`${this.apiUrl}/entrar?codigo=${codigo}&usuarioId=${usuarioId}`, {});
  }

  convidar(grupoId: string, email: string, deUsuarioId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${grupoId}/convidar`, { email, deUsuarioId });
  }
}
