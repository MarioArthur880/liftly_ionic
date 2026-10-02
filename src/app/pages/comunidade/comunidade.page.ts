import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton,
  IonFabList, IonButton
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  add, peopleOutline, personAddOutline, keyOutline,
  trophyOutline, chevronForwardOutline, mailOutline, checkmarkOutline, closeOutline
} from 'ionicons/icons';

import { GrupoModel, NovoGrupoModel } from '../../model/grupo.model';
import { ConviteModel } from '../../model/convite.model';
import { UsuarioModel } from '../../model/usuario.model';
import { GrupoService } from '../../services/grupo.service';
import { ConviteService } from '../../services/convite.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comunidade',
  templateUrl: './comunidade.page.html',
  styleUrls: ['./comunidade.page.scss'],
  standalone: true,
  imports: [
    IonButton, IonFabList, IonFabButton, IonFab, IonIcon, IonLabel,
    IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, RouterModule
  ]
})
export class ComunidadePage implements OnInit {

  grupos: GrupoModel[] = [];
  convites: ConviteModel[] = [];
  criandoGrupo = false;
  usuario: UsuarioModel;

  constructor(
    private grupoService: GrupoService,
    private conviteService: ConviteService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController
  ) {
    addIcons({
      add, 'people-outline': peopleOutline, 'person-add-outline': personAddOutline,
      'key-outline': keyOutline, 'trophy-outline': trophyOutline,
      'chevron-forward-outline': chevronForwardOutline, 'mail-outline': mailOutline,
      'checkmark-outline': checkmarkOutline, 'close-outline': closeOutline
    });
    this.usuario = new UsuarioModel();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuario = this.authService.obterSessao();
    this.carregar();
  }

  carregar() {
    this.grupoService.listarPorUsuario(this.usuario.id).subscribe(grupos => this.grupos = grupos);
    this.conviteService.listarPendentes(this.usuario.id).subscribe(convites => this.convites = convites);
  }

  abrirGrupo(grupo: GrupoModel) {
    this.navController.navigateForward(`/grupo/${grupo.id}`);
  }

  async criarGrupo() {
    const alert = await this.alertController.create({
      header: 'Criar grupo',
      message: 'Dê um nome para o seu grupo de treino.',
      inputs: [{ name: 'nome', type: 'text', placeholder: 'Ex: Time da Academia' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Criar',
          handler: (dados) => {
            if (this.criandoGrupo) return false;
            const nome = (dados.nome || '').trim();
            if (!nome) {
              this.exibirMensagem('Informe um nome para o grupo.');
              return false;
            }
            const novoGrupo = new NovoGrupoModel();
            novoGrupo.nome = nome;
            novoGrupo.criadorId = this.usuario.id;
            this.criandoGrupo = true;
            this.grupoService.criar(novoGrupo).subscribe({
              next: () => {
                this.criandoGrupo = false;
                this.exibirMensagem('Grupo criado com sucesso!');
                this.carregar();
              },
              error: () => { this.criandoGrupo = false; /* A notificação é exibida pelo interceptor da API. */ }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async entrarComCodigo() {
    const alert = await this.alertController.create({
      header: 'Entrar em um grupo',
      message: 'Digite o código de convite compartilhado pelo seu amigo.',
      inputs: [{ name: 'codigo', type: 'text', placeholder: 'Código do grupo' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Entrar',
          handler: (dados) => {
            const codigo = (dados.codigo || '').trim();
            if (!codigo) {
              this.exibirMensagem('Informe o código do grupo.');
              return false;
            }
            this.grupoService.entrarPorCodigo(codigo, this.usuario.id).subscribe({
              next: () => {
                this.exibirMensagem('Você entrou no grupo!');
                this.carregar();
              },
              error: () => {}
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  aceitarConvite(convite: ConviteModel) {
    this.conviteService.aceitar(convite.id).subscribe({
      next: () => {
        this.exibirMensagem(`Você entrou no grupo "${convite.grupoNome}"!`);
        this.carregar();
      },
      error: () => {}
    });
  }

  recusarConvite(convite: ConviteModel) {
    this.conviteService.recusar(convite.id).subscribe({
      next: () => this.carregar(),
      error: () => {}
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 1800, position: 'bottom' });
    toast.present();
  }
}
