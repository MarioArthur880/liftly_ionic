import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConviteModel } from '../model/convite.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConviteService {
  private apiUrl = `${environment.apiUrl}/convites`;

  constructor(private http: HttpClient) {}

  listarPendentes(usuarioId: string): Observable<ConviteModel[]> {
    return this.http.get<ConviteModel[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  aceitar(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/aceitar`, {});
  }

  recusar(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/recusar`, {});
  }
}
