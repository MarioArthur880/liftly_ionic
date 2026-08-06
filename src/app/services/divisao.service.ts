import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DivisaoModel } from '../model/divisao.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DivisaoService {
  private apiUrl = `${environment.apiUrl}/divisoes`;

  constructor(private http: HttpClient) {}

  listarPorUsuario(usuarioId: string): Observable<DivisaoModel[]> {
    return this.http.get<DivisaoModel[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  buscarPorId(id: string): Observable<DivisaoModel> {
    return this.http.get<DivisaoModel>(`${this.apiUrl}/${id}`);
  }

  salvar(divisao: DivisaoModel): Observable<DivisaoModel> {
    if (divisao.id) {
      return this.http.put<DivisaoModel>(`${this.apiUrl}/${divisao.id}`, divisao);
    }
    return this.http.post<DivisaoModel>(this.apiUrl, divisao);
  }

  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
