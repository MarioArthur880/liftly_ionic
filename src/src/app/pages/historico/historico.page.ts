import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, barbellOutline } from 'ionicons/icons';

import { HistoricoService } from '../../services/historico.service';
import { AuthService } from '../../services/auth.service';
import { HistoricoModel, HistoricoExercicioModel } from '../../model/historico.model';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule
  ]
})
export class HistoricoPage implements OnInit {

  historico: HistoricoModel[] = [];
  // Controla quais sessões estão expandidas
  expandidos: Set<string> = new Set();

  constructor(
    private authService: AuthService,
    private historicoService: HistoricoService
  ) {
    addIcons({
      'time-outline': timeOutline,
      'barbell-outline': barbellOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    const usuario = this.authService.obterSessao();
    this.historicoService.listarPorUsuario(usuario.id).subscribe(historico => this.historico = historico);
  }

  toggleExpandir(id: string) {
    if (this.expandidos.has(id)) {
      this.expandidos.delete(id);
    } else {
      this.expandidos.add(id);
    }
  }

  estaExpandido(id: string): boolean {
    return this.expandidos.has(id);
  }

  // Quantas séries foram feitas neste exercício
  seriesFeitasEx(ex: HistoricoExercicioModel): number {
    return ex.seriesFeitas ? ex.seriesFeitas.filter(s => s).length : 0;
  }

  // Exercício considerado completo se todas as séries foram feitas
  exCompleto(ex: HistoricoExercicioModel): boolean {
    return ex.seriesFeitas ? ex.seriesFeitas.every(s => s) : false;
  }

  // Total de séries feitas na sessão inteira
  totalSeriesFeitas(sessao: HistoricoModel): number {
    return sessao.exercicios.reduce((acc, ex) => acc + this.seriesFeitasEx(ex), 0);
  }

  // Total de séries planejadas na sessão
  totalSeriesPlanejadas(sessao: HistoricoModel): number {
    return sessao.exercicios.reduce((acc, ex) => acc + ex.series, 0);
  }

  percentual(sessao: HistoricoModel): number {
    const total = this.totalSeriesPlanejadas(sessao);
    if (total === 0) return 0;
    return Math.round((this.totalSeriesFeitas(sessao) / total) * 100);
  }

  calcularDuracao(inicio: string, fim: string): string {
    const min = Math.round(
      (new Date(fim).getTime() - new Date(inicio).getTime()) / 60000
    );
    if (min < 1) return '< 1 min';
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
