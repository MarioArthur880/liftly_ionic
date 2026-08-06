import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoModel } from '../model/historico.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private apiUrl = `${environment.apiUrl}/historicos`;

  constructor(private http: HttpClient) {}

  salvar(historico: HistoricoModel): Observable<HistoricoModel> {
    return this.http.post<HistoricoModel>(this.apiUrl, historico);
  }

  listarPorUsuario(usuarioId: string): Observable<HistoricoModel[]> {
    return this.http.get<HistoricoModel[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }
}
