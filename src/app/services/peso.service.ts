import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PesoRegistroModel } from '../model/peso-registro.model';

@Injectable({ providedIn: 'root' })
export class PesoService {
  private apiUrl = `${environment.apiUrl}/pesos`;

  constructor(private http: HttpClient) {}

  listar(): Observable<PesoRegistroModel[]> {
    return this.http.get<PesoRegistroModel[]>(this.apiUrl);
  }
}
