import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonIcon, IonButton
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  barbellOutline, flameOutline, trophyOutline,
  playCircleOutline, personOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { DivisaoService } from '../../services/divisao.service';
import { HistoricoService } from '../../services/historico.service';
import { UsuarioModel } from '../../model/usuario.model';
import { DivisaoModel } from '../../model/divisao.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonButton, IonIcon, IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule, RouterModule
  ]
})
export class DashboardPage implements OnInit {

  usuario: UsuarioModel;
  divisoes: DivisaoModel[] = [];
  totalTreinos = 0;
  totalSessoes = 0;

  constructor(
    private authService: AuthService,
    private divisaoService: DivisaoService,
    private historicoService: HistoricoService,
    private navController: NavController
  ) {
    addIcons({
      'barbell-outline': barbellOutline,
      'flame-outline': flameOutline,
      'trophy-outline': trophyOutline,
      'play-circle-outline': playCircleOutline,
      'person-outline': personOutline
    });
    this.usuario = new UsuarioModel();
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuario = this.authService.obterSessao();
    this.divisoes = this.divisaoService.listarPorUsuario(this.usuario.id);
    this.totalTreinos = this.divisoes.length;
    this.totalSessoes = this.historicoService.listarPorUsuario(this.usuario.id).length;
  }

  iniciarTreino(divisao: DivisaoModel) {
    this.navController.navigateForward(`/executar-treino/${divisao.id}`);
  }
}
