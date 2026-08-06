import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExercicioCatalogoModel } from '../model/exercicio-catalogo.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExercicioCatalogoService {
  private apiUrl = `${environment.apiUrl}/exercicios-catalogo`;

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<ExercicioCatalogoModel[]> {
    return this.http.get<ExercicioCatalogoModel[]>(this.apiUrl);
  }

  listarPorGrupo(grupo: string): Observable<ExercicioCatalogoModel[]> {
    const params = new HttpParams().set('grupo', grupo);
    return this.http.get<ExercicioCatalogoModel[]>(this.apiUrl, { params });
  }

  buscarPorNome(termo: string): Observable<ExercicioCatalogoModel[]> {
    const params = termo ? new HttpParams().set('termo', termo) : new HttpParams();
    return this.http.get<ExercicioCatalogoModel[]>(this.apiUrl, { params });
  }

  listarGrupos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/grupos`);
  }
}
