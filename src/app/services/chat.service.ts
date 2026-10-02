import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MensagemModel } from '../model/mensagem.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.apiUrl}/grupos`;

  constructor(private http: HttpClient) {}

  listar(grupoId: string): Observable<MensagemModel[]> {
    return this.http.get<MensagemModel[]>(`${this.apiUrl}/${grupoId}/mensagens`);
  }

  enviar(grupoId: string, texto: string, imagem: string | null, chave: string): Observable<MensagemModel> {
    return this.http.post<MensagemModel>(`${this.apiUrl}/${grupoId}/mensagens`, { texto, imagem }, { headers: { 'Idempotency-Key': chave } });
  }
}
