import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
  IonButton, IonButtons, IonIcon, IonNote, IonModal, IonSearchbar,
  IonChip, IonList, IonItem, IonLabel, IonInput, IonTextarea
} from '@ionic/angular/standalone';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline, closeOutline, addCircleOutline, trashOutline,
  createOutline, checkmarkOutline
} from 'ionicons/icons';

import { DivisaoService } from '../../services/divisao.service';
import { HistoricoService } from '../../services/historico.service';
import { AuthService } from '../../services/auth.service';
import { ExercicioCatalogoService } from '../../services/exercicio-catalogo.service';
import { DivisaoModel } from '../../model/divisao.model';
import { ExercicioCatalogoModel } from '../../model/exercicio-catalogo.model';
import { HistoricoModel, HistoricoExercicioModel } from '../../model/historico.model';

@Component({
  selector: 'app-executar-treino',
  templateUrl: './executar-treino.page.html',
  styleUrls: ['./executar-treino.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonFooter,
    IonButton, IonButtons, IonIcon, IonNote, IonModal, IonSearchbar,
    IonChip, IonList, IonItem, IonLabel, IonInput, IonTextarea,
    CommonModule, FormsModule, ReactiveFormsModule
  ]
})
export class ExecutarTreinoPage implements OnInit, OnDestroy {

  divisao: DivisaoModel | null = null;
  exercicios: HistoricoExercicioModel[] = [];
  dataInicio = '';

  tempoSegundos = 0;
  tempoFormatado = '00:00';
  private intervalo: ReturnType<typeof setInterval> | null = null;

  modalAvulsoAberto = false;
  termoBusca = '';
  grupoFiltro = '';
  exercicioSelecionado: ExercicioCatalogoModel | null = null;
  exercicioAvulsoEditando: HistoricoExercicioModel | null = null;
  resultadosBusca: ExercicioCatalogoModel[] = [];
  catalogoCompleto: ExercicioCatalogoModel[] = [];
  grupos: string[] = [];
  formAvulso: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private divisaoService: DivisaoService,
    private historicoService: HistoricoService,
    private catalogoService: ExercicioCatalogoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController
  ) {
    addIcons({
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-outline': closeOutline,
      'add-circle-outline': addCircleOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'checkmark-outline': checkmarkOutline
    });

    this.formAvulso = this.formBuilder.group({
      series: [3, [Validators.required, Validators.min(1), Validators.max(30)]],
      repeticoes: [10, [Validators.required, Validators.min(1), Validators.max(200)]],
      carga: [0, [Validators.required, Validators.min(0), Validators.max(2000)]],
      descansoSegundos: [60, [Validators.required, Validators.min(0), Validators.max(3600)]],
      observacao: ['', Validators.maxLength(300)]
    });
  }

  ngOnInit() {
    this.catalogoService.listarGrupos().subscribe(grupos => this.grupos = grupos);
    this.catalogoService.listarTodos().subscribe(exercicios => {
      this.catalogoCompleto = exercicios;
      this.resultadosBusca = exercicios;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.divisaoService.buscarPorId(id).subscribe({
        next: (divisao) => {
          this.divisao = divisao;
          this.exercicios = (divisao.exercicios || []).map(ex => {
            const item = new HistoricoExercicioModel();
            item.exercicioId = ex.id;
            item.catalogoId = ex.catalogoId || '';
            item.nome = ex.nome;
            item.grupoMuscular = ex.grupoMuscular;
            item.series = ex.series;
            item.repeticoes = ex.repeticoes;
            item.carga = ex.carga;
            item.descansoSegundos = ex.descansoSegundos || 0;
            item.observacao = ex.observacao;
            item.avulso = false;
            item.seriesFeitas = Array(ex.series).fill(false);
            return item;
          });
          this.dataInicio = new Date().toISOString();
          this.iniciarCronometro();
        },
        error: () => this.exibirMensagem('Divisão não encontrada.')
      });
    }
  }

  ngOnDestroy() {
    this.pararCronometro();
  }

  totalSeriesFeitasEx(item: HistoricoExercicioModel): number {
    return item.seriesFeitas.filter(s => s).length;
  }

  todasSeriesFeitas(item: HistoricoExercicioModel): boolean {
    return item.seriesFeitas.length > 0 && item.seriesFeitas.every(s => s);
  }

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

  toggleSerie(item: HistoricoExercicioModel, index: number) {
    const estaMarcada = item.seriesFeitas[index];
    if (!estaMarcada) {
      const anterioresConcluidas = item.seriesFeitas.slice(0, index).every(serie => serie);
      if (!anterioresConcluidas) {
        this.exibirMensagem(`Conclua primeiro a série ${index}.`);
        return;
      }
      item.seriesFeitas[index] = true;
      return;
    }
    for (let i = index; i < item.seriesFeitas.length; i++) item.seriesFeitas[i] = false;
  }

  serieBloqueada(item: HistoricoExercicioModel, index: number): boolean {
    return !item.seriesFeitas[index] && !item.seriesFeitas.slice(0, index).every(serie => serie);
  }

  toggleTodas(item: HistoricoExercicioModel) {
    const todasMarcadas = this.todasSeriesFeitas(item);
    item.seriesFeitas = item.seriesFeitas.map(() => !todasMarcadas);
  }

  abrirModalAvulso() {
    this.exercicioAvulsoEditando = null;
    this.exercicioSelecionado = null;
    this.termoBusca = '';
    this.grupoFiltro = '';
    this.formAvulso.reset({ series: 3, repeticoes: 10, carga: 0, descansoSegundos: 60, observacao: '' });
    this.resultadosBusca = this.catalogoCompleto;
    this.modalAvulsoAberto = true;
  }

  fecharModalAvulso() {
    this.modalAvulsoAberto = false;
    this.exercicioSelecionado = null;
    this.exercicioAvulsoEditando = null;
  }

  onBuscaAvulso() {
    const termo = this.termoBusca.trim().toLowerCase();
    this.resultadosBusca = this.catalogoCompleto.filter(ex => {
      const bateTermo = !termo || ex.nome.toLowerCase().includes(termo) || ex.grupoMuscular.toLowerCase().includes(termo);
      const bateGrupo = !this.grupoFiltro || ex.grupoMuscular === this.grupoFiltro;
      return bateTermo && bateGrupo;
    });
  }

  filtrarGrupoAvulso(grupo: string) {
    this.grupoFiltro = this.grupoFiltro === grupo ? '' : grupo;
    this.onBuscaAvulso();
  }

  selecionarExercicioAvulso(ex: ExercicioCatalogoModel) {
    if (this.exercicioJaNaSessao(ex)) {
      this.exibirMensagem('Esse exercício já está nesta sessão.');
      return;
    }
    this.exercicioSelecionado = ex;
  }

  voltarParaBuscaAvulso() {
    if (this.exercicioAvulsoEditando) return;
    this.exercicioSelecionado = null;
  }

  confirmarAvulso() {
    if (!this.exercicioSelecionado || this.formAvulso.invalid) return;
    const valores = this.formAvulso.getRawValue();

    if (this.exercicioAvulsoEditando) {
      const item = this.exercicioAvulsoEditando;
      const novasSeries = Number(valores.series);
      const feitasAntigas = [...item.seriesFeitas];
      item.series = novasSeries;
      item.repeticoes = Number(valores.repeticoes);
      item.carga = Number(valores.carga);
      item.descansoSegundos = Number(valores.descansoSegundos);
      item.observacao = (valores.observacao || '').trim();
      item.seriesFeitas = Array(novasSeries).fill(false).map((_, i) => feitasAntigas[i] || false);
      this.fecharModalAvulso();
      this.exibirMensagem('Exercício avulso atualizado.');
      return;
    }

    if (this.exercicioJaNaSessao(this.exercicioSelecionado)) {
      this.exibirMensagem('Esse exercício já está nesta sessão.');
      return;
    }

    const item = new HistoricoExercicioModel();
    item.exercicioId = `avulso-${this.exercicioSelecionado.id}-${Date.now()}`;
    item.catalogoId = this.exercicioSelecionado.id;
    item.nome = this.exercicioSelecionado.nome;
    item.grupoMuscular = this.exercicioSelecionado.grupoMuscular;
    item.series = Number(valores.series);
    item.repeticoes = Number(valores.repeticoes);
    item.carga = Number(valores.carga);
    item.descansoSegundos = Number(valores.descansoSegundos);
    item.observacao = (valores.observacao || '').trim();
    item.avulso = true;
    item.seriesFeitas = Array(item.series).fill(false);
    this.exercicios.push(item);
    this.fecharModalAvulso();
    this.exibirMensagem(`${item.nome} adicionado somente a esta sessão.`);
  }

  editarAvulso(item: HistoricoExercicioModel) {
    if (!item.avulso) return;
    const catalogo = this.catalogoCompleto.find(ex => ex.id === item.catalogoId);
    this.exercicioSelecionado = catalogo || {
      id: item.catalogoId,
      nome: item.nome,
      grupoMuscular: item.grupoMuscular,
      descricao: 'Exercício avulso desta sessão',
      equipamento: ''
    };
    this.exercicioAvulsoEditando = item;
    this.formAvulso.reset({
      series: item.series,
      repeticoes: item.repeticoes,
      carga: item.carga,
      descansoSegundos: item.descansoSegundos || 0,
      observacao: item.observacao || ''
    });
    this.modalAvulsoAberto = true;
  }

  async removerAvulso(item: HistoricoExercicioModel) {
    if (!item.avulso) return;
    const alert = await this.alertController.create({
      header: 'Remover exercício avulso',
      message: `Remover "${item.nome}" somente desta sessão?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover', role: 'destructive', handler: () => {
            this.exercicios = this.exercicios.filter(ex => ex !== item);
          }
        }
      ]
    });
    await alert.present();
  }

  private exercicioJaNaSessao(ex: ExercicioCatalogoModel): boolean {
    const nome = ex.nome.trim().toLocaleLowerCase('pt-BR');
    return this.exercicios.some(item =>
      (!!item.catalogoId && item.catalogoId === ex.id) || item.nome.trim().toLocaleLowerCase('pt-BR') === nome
    );
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
    this.intervalo = null;
  }

  async finalizar() {
    if (!this.divisao) return;
    const alert = await this.alertController.create({
      header: 'Finalizar treino',
      message: `Você completou ${this.totalSeriesFeitas} de ${this.totalSeriesPlanejasdas} série(s). Deseja finalizar?`,
      buttons: [
        { text: 'Continuar', role: 'cancel' },
        { text: 'Finalizar', handler: () => this.salvarHistorico() }
      ]
    });
    await alert.present();
  }

  private salvarHistorico() {
    const usuario = this.authService.obterSessao();
    if (!usuario?.id) {
      this.exibirMensagem('Usuário não encontrado. Faça login novamente.');
      return;
    }
    if (this.exercicios.length === 0) {
      this.exibirMensagem('A sessão precisa ter ao menos um exercício.');
      return;
    }

    const historico = new HistoricoModel();
    historico.usuarioId = usuario.id;
    historico.divisaoId = this.divisao!.id;
    historico.divisaoNome = this.divisao!.nome;
    historico.dataInicio = this.dataInicio;
    historico.dataFim = new Date().toISOString();
    historico.exercicios = this.exercicios;

    this.pararCronometro();
    this.historicoService.salvar(historico).subscribe({
      next: () => this.navController.navigateRoot('/tabs/historico'),
      error: () => {
        this.iniciarCronometro();
        this.exibirMensagem('Erro ao salvar histórico.');
      }
    });
  }

  async confirmarSair() {
    const alert = await this.alertController.create({
      header: 'Sair do treino',
      message: 'Tem certeza? O progresso não será salvo.',
      buttons: [
        { text: 'Continuar treino', role: 'cancel' },
        {
          text: 'Sair', role: 'destructive', handler: () => {
            this.pararCronometro();
            this.navController.back();
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2200, position: 'bottom' });
    await toast.present();
  }
}
