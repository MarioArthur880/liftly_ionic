import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButton, IonButtons, IonIcon, IonNote
} from '@ionic/angular/standalone';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline, ellipseOutline, checkmarkCircleOutline, closeOutline
} from 'ionicons/icons';

import { DivisaoService } from '../../services/divisao.service';
import { HistoricoService } from '../../services/historico.service';
import { AuthService } from '../../services/auth.service';
import { DivisaoModel } from '../../model/divisao.model';
import { HistoricoModel, HistoricoExercicioModel } from '../../model/historico.model';

@Component({
  selector: 'app-executar-treino',
  templateUrl: './executar-treino.page.html',
  styleUrls: ['./executar-treino.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonButton, IonButtons, IonIcon, IonNote,
    CommonModule
  ]
})
export class ExecutarTreinoPage implements OnInit, OnDestroy {

  divisao: DivisaoModel | null = null;
  exercicios: HistoricoExercicioModel[] = [];
  dataInicio = '';

  tempoSegundos = 0;
  tempoFormatado = '00:00';
  private intervalo: any;

  constructor(
    private route: ActivatedRoute,
    private divisaoService: DivisaoService,
    private historicoService: HistoricoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController
  ) {
    addIcons({
      'checkmark-outline': checkmarkOutline,
      'ellipse-outline': ellipseOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-outline': closeOutline
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.divisao = this.divisaoService.buscarPorId(id);
      if (this.divisao) {
        // Cada exercício gera um array de booleans, um por série
        this.exercicios = this.divisao.exercicios.map(ex => {
          const item = new HistoricoExercicioModel();
          item.exercicioId = ex.id;
          item.nome = ex.nome;
          item.series = ex.series;
          item.repeticoes = ex.repeticoes;
          item.carga = ex.carga;
          item.observacao = ex.observacao;
          item.seriesFeitas = Array(ex.series).fill(false);
          return item;
        });
        this.dataInicio = new Date().toISOString();
        this.iniciarCronometro();
      }
    }
  }

  ngOnDestroy() {
    this.pararCronometro();
  }

  // Helpers de contagem por exercício
  totalSeriesFeitasEx(item: HistoricoExercicioModel): number {
    return item.seriesFeitas.filter(s => s).length;
  }

  todasSeriesFeitas(item: HistoricoExercicioModel): boolean {
    return item.seriesFeitas.every(s => s);
  }

  // Total geral de séries feitas (para o botão finalizar)
  get totalSeriesFeitas(): number {
    return this.exercicios.reduce((acc, ex) => acc + ex.seriesFeitas.filter(s => s).length, 0);
  }

  get totalSeriesPlanejasdas(): number {
    return this.exercicios.reduce((acc, ex) => acc + ex.series, 0);
  }

  get percentualFeitos(): number {
    if (this.totalSeriesPlanejasdas === 0) return 0;
    return (this.totalSeriesFeitas / this.totalSeriesPlanejasdas) * 100;
  }

  // Marca/desmarca uma série específica de um exercício
  toggleSerie(item: HistoricoExercicioModel, index: number) {
    item.seriesFeitas[index] = !item.seriesFeitas[index];
  }

  // Marca/desmarca TODAS as séries de um exercício de uma vez
  toggleTodas(item: HistoricoExercicioModel) {
    const todasMarcadas = this.todasSeriesFeitas(item);
    item.seriesFeitas = item.seriesFeitas.map(() => !todasMarcadas);
  }

  private iniciarCronometro() {
    this.intervalo = setInterval(() => {
      this.tempoSegundos++;
      const m = Math.floor(this.tempoSegundos / 60).toString().padStart(2, '0');
      const s = (this.tempoSegundos % 60).toString().padStart(2, '0');
      this.tempoFormatado = `${m}:${s}`;
    }, 1000);
  }

  private pararCronometro() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  async finalizar() {
    if (!this.divisao) return;

    const alert = await this.alertController.create({
      header: 'Finalizar treino',
      message: `Você completou ${this.totalSeriesFeitas} de ${this.totalSeriesPlanejasdas} série(s). Deseja finalizar?`,
      buttons: [
        { text: 'Continuar', role: 'cancel' },
        {
          text: 'Finalizar',
          handler: () => { this.salvarHistorico(); }
        }
      ]
    });
    await alert.present();
  }

  private salvarHistorico() {
    const usuario = this.authService.obterSessao();
    const historico = new HistoricoModel();
    historico.usuarioId = usuario.id;
    historico.divisaoId = this.divisao!.id;
    historico.divisaoNome = this.divisao!.nome;
    historico.dataInicio = this.dataInicio;
    historico.dataFim = new Date().toISOString();
    historico.exercicios = this.exercicios;

    this.pararCronometro();
    this.historicoService.salvar(historico);
    this.navController.navigateRoot('/tabs/historico');
  }

  async confirmarSair() {
    const alert = await this.alertController.create({
      header: 'Sair do treino',
      message: 'Tem certeza? O progresso não será salvo.',
      buttons: [
        { text: 'Continuar treino', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            this.pararCronometro();
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }
}
