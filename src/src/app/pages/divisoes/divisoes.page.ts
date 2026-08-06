import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonList, IonItem, IonLabel, IonIcon, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption, IonBadge
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, barbellOutline, trashOutline, createOutline, chevronForwardOutline } from 'ionicons/icons';

import { DivisaoModel } from '../../model/divisao.model';
import { UsuarioModel } from '../../model/usuario.model';
import { DivisaoService } from '../../services/divisao.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-divisoes',
  templateUrl: './divisoes.page.html',
  styleUrls: ['./divisoes.page.scss'],
  standalone: true,
  imports: [
    IonBadge, IonItemOption, IonItemOptions, IonItemSliding,
    IonFabButton, IonFab, IonIcon, IonLabel, IonItem, IonList,
    IonContent, IonHeader, IonTitle, IonToolbar,
    CommonModule, RouterModule
  ]
})
export class DivisoesPage implements OnInit {

  divisoes: DivisaoModel[] = [];
  usuario: UsuarioModel;

  constructor(
    private divisaoService: DivisaoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController,
    private navController: NavController
  ) {
    addIcons({
      add,
      'barbell-outline': barbellOutline,
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'chevron-forward-outline': chevronForwardOutline
    });
    this.usuario = new UsuarioModel();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuario = this.authService.obterSessao();
    this.carregar();
  }

  carregar() {
    this.divisoes = this.divisaoService.listarPorUsuario(this.usuario.id);
  }

  editar(divisao: DivisaoModel, sliding: IonItemSliding) {
    sliding.close();
    this.navController.navigateForward(`/add-divisao/${divisao.id}`);
  }

  async excluir(divisao: DivisaoModel, sliding: IonItemSliding) {
    sliding.close();
    const alert = await this.alertController.create({
      header: 'Confirmar exclusão',
      message: `Deseja remover a divisão "${divisao.nome}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.divisaoService.excluir(divisao.id);
            this.exibirMensagem('Divisão excluída com sucesso!');
            this.carregar();
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 1800, position: 'bottom' });
    toast.present();
  }
}
