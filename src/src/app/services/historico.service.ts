import { Injectable } from '@angular/core';
import { HistoricoModel } from '../model/historico.model';

const HISTORICO_KEY = 'liftly_historico';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {

  salvar(historico: HistoricoModel): void {
    const lista = this.todos();
    historico.id = this.gerarId();
    lista.push(historico);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(lista));
  }

  listarPorUsuario(usuarioId: string): HistoricoModel[] {
    return this.todos()
      .filter(h => h.usuarioId === usuarioId)
      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime());
  }

  private todos(): HistoricoModel[] {
    const dados = localStorage.getItem(HISTORICO_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  private gerarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
