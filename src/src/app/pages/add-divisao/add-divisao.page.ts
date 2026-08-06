import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonItem, IonInput, IonLabel, IonIcon, IonTextarea,
  IonList, IonSearchbar, IonModal, IonChip
} from '@ionic/angular/standalone';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, trashOutline, checkmarkOutline, searchOutline, closeOutline, addCircleOutline } from 'ionicons/icons';

import { DivisaoModel, ExercicioModel } from '../../model/divisao.model';
import { ExercicioCatalogoModel } from '../../model/exercicio-catalogo.model';
import { DivisaoService } from '../../services/divisao.service';
import { ExercicioCatalogoService } from '../../services/exercicio-catalogo.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-divisao',
  templateUrl: './add-divisao.page.html',
  styleUrls: ['./add-divisao.page.scss'],
  standalone: true,
  imports: [
    IonChip, IonModal, IonSearchbar, IonList,
    IonIcon, IonLabel, IonTextarea, IonInput, IonItem, IonButton,
    IonBackButton, IonButtons, IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule, FormsModule
  ]
})
export class AddDivisaoPage implements OnInit {

  divisao: DivisaoModel;
  formGroup: FormGroup;
  modoEdicao = false;

  // Modal de seleção de exercício
  modalAberto = false;
  termoBusca = '';
  grupoFiltro = '';
  exercicioSelecionado: ExercicioCatalogoModel | null = null;
  resultadosBusca: ExercicioCatalogoModel[] = [];
  grupos: string[] = [];

  // Form de configuração (séries/reps/carga) após selecionar
  formConfig: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private divisaoService: DivisaoService,
    private catalogoService: ExercicioCatalogoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController,
    private route: ActivatedRoute
  ) {
    addIcons({
      add,
      'trash-outline': trashOutline,
      'checkmark-outline': checkmarkOutline,
      'search-outline': searchOutline,
      'close-outline': closeOutline,
      'add-circle-outline': addCircleOutline,
    });

    this.divisao = new DivisaoModel();

    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.compose([Validators.required, Validators.minLength(2)])],
      descricao: ['']
    });

    this.formConfig = this.formBuilder.group({
      series: [3, Validators.compose([Validators.required, Validators.min(1)])],
      repeticoes: [10, Validators.compose([Validators.required, Validators.min(1)])],
      carga: [0, Validators.min(0)],
      observacao: ['']
    });
  }

  ngOnInit() {
    this.grupos = this.catalogoService.listarGrupos();
    this.resultadosBusca = this.catalogoService.listarTodos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const encontrada = this.divisaoService.buscarPorId(id);
      if (encontrada) {
        this.divisao = encontrada;
        this.modoEdicao = true;
        this.formGroup.patchValue({ nome: this.divisao.nome, descricao: this.divisao.descricao });
      }
    }
  }

  abrirModal() {
    this.termoBusca = '';
    this.grupoFiltro = '';
    this.exercicioSelecionado = null;
    this.formConfig.reset({ series: 3, repeticoes: 10, carga: 0, observacao: '' });
    this.resultadosBusca = this.catalogoService.listarTodos();
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.exercicioSelecionado = null;
  }

  onBusca() {
    let lista = this.catalogoService.buscarPorNome(this.termoBusca);
    if (this.grupoFiltro) {
      lista = lista.filter(e => e.grupoMuscular === this.grupoFiltro);
    }
    this.resultadosBusca = lista;
  }

  filtrarGrupo(grupo: string) {
    this.grupoFiltro = this.grupoFiltro === grupo ? '' : grupo;
    this.onBusca();
  }

  selecionarExercicio(ex: ExercicioCatalogoModel) {
    this.exercicioSelecionado = ex;
  }

  voltarParaBusca() {
    this.exercicioSelecionado = null;
  }

  confirmarExercicio() {
    if (!this.exercicioSelecionado || !this.formConfig.valid) return;

    const jaAdicionado = this.divisao.exercicios.some(e => e.id === this.exercicioSelecionado!.id);
    if (jaAdicionado) {
      this.exibirMensagem('Este exercício já está na divisão.');
      return;
    }

    const ex = new ExercicioModel();
    ex.id = this.exercicioSelecionado.id;
    ex.nome = this.exercicioSelecionado.nome;
    ex.grupoMuscular = this.exercicioSelecionado.grupoMuscular;
    ex.series = this.formConfig.value.series;
    ex.repeticoes = this.formConfig.value.repeticoes;
    ex.carga = this.formConfig.value.carga;
    ex.observacao = this.formConfig.value.observacao;

    this.divisao.exercicios.push(ex);
    this.modalAberto = false;
    this.exercicioSelecionado = null;
    this.exibirMensagem(`${ex.nome} adicionado!`);
  }

  async removerExercicio(ex: ExercicioModel) {
    const alert = await this.alertController.create({
      header: 'Remover exercício',
      message: `Remover "${ex.nome}" desta divisão?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.divisao.exercicios = this.divisao.exercicios.filter(e => e.id !== ex.id);
          }
        }
      ]
    });
    await alert.present();
  }

  salvar() {
    if (!this.formGroup.valid) {
      this.exibirMensagem('Informe o nome da divisão.');
      return;
    }
    const usuario = this.authService.obterSessao();
    this.divisao.nome = this.formGroup.value.nome;
    this.divisao.descricao = this.formGroup.value.descricao;
    this.divisao.usuarioId = usuario.id;

    this.divisaoService.salvar(this.divisao);
    this.exibirMensagem(this.modoEdicao ? 'Divisão atualizada!' : 'Divisão criada!');
    this.navController.navigateBack('/tabs/divisoes');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 1800, position: 'bottom' });
    toast.present();
  }
}
