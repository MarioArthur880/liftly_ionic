import { Injectable } from '@angular/core';
import { DivisaoModel } from '../model/divisao.model';

const DIVISOES_KEY = 'liftly_divisoes';

@Injectable({
  providedIn: 'root'
})
export class DivisaoService {

  listarPorUsuario(usuarioId: string): DivisaoModel[] {
    return this.todas().filter(d => d.usuarioId === usuarioId);
  }

  buscarPorId(id: string): DivisaoModel | null {
    return this.todas().find(d => d.id === id) ?? null;
  }

  salvar(divisao: DivisaoModel): void {
    const lista = this.todas();
    if (divisao.id) {
      const idx = lista.findIndex(d => d.id === divisao.id);
      if (idx >= 0) lista[idx] = divisao;
      else lista.push(divisao);
    } else {
      divisao.id = this.gerarId();
      divisao.dataCriacao = new Date().toISOString();
      lista.push(divisao);
    }
    localStorage.setItem(DIVISOES_KEY, JSON.stringify(lista));
  }

  excluir(id: string): void {
    const lista = this.todas().filter(d => d.id !== id);
    localStorage.setItem(DIVISOES_KEY, JSON.stringify(lista));
  }

  private todas(): DivisaoModel[] {
    const dados = localStorage.getItem(DIVISOES_KEY);
    return dados ? JSON.parse(dados) : [];
  }

  private gerarId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
