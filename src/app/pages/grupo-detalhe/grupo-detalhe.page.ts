import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonBackButton, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, keyOutline, flameOutline, trophyOutline } from 'ionicons/icons';

import { GrupoDetalheModel } from '../../model/grupo.model';
import { AuthService } from '../../services/auth.service';
import { GrupoService } from '../../services/grupo.service';

@Component({
  selector: 'app-grupo-detalhe',
  templateUrl: './grupo-detalhe.page.html',
  styleUrls: ['./grupo-detalhe.page.scss'],
  standalone: true,
  imports: [
    IonLabel, IonItem, IonList, IonIcon, IonButton, IonButtons,
    IonBackButton, IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule
  ]
})
export class GrupoDetalhePage implements OnInit {

  grupo: GrupoDetalheModel = new GrupoDetalheModel();
  usuarioId = '';
  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private grupoService: GrupoService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'person-add-outline': personAddOutline, 'key-outline': keyOutline,
      'flame-outline': flameOutline, 'trophy-outline': trophyOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuarioId = this.authService.obterSessao().id;
    this.carregar();
  }

  carregar() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.carregando = true;
    this.grupoService.buscarDetalhe(id).subscribe({
      next: (grupo) => {
        this.grupo = grupo;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar o grupo.');
      }
    });
  }

  async convidarPorEmail() {
    const alert = await this.alertController.create({
      header: 'Convidar amigo',
      message: 'Digite o e-mail cadastrado no Liftly do seu amigo.',
      inputs: [{ name: 'email', type: 'email', placeholder: 'email@exemplo.com' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Convidar',
          handler: (dados) => {
            const email = (dados.email || '').trim();
            if (!email) {
              this.exibirMensagem('Informe um e-mail válido.');
              return false;
            }
            this.grupoService.convidar(this.grupo.id, email, this.usuarioId).subscribe({
              next: () => this.exibirMensagem('Convite enviado!'),
              error: (erro) => {
                const mensagem = erro.status === 404
                  ? 'Não encontramos um usuário Liftly com esse e-mail.'
                  : erro.status === 409
                    ? 'Esse usuário já faz parte do grupo.'
                    : 'Erro ao enviar convite.';
                this.exibirMensagem(mensagem);
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
