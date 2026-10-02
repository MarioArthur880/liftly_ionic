import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, barbellOutline, timeOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { ConviteService } from '../../services/convite.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge]
})
export class TabsPage {
  convitesPendentes = 0;

  constructor(
    private conviteService: ConviteService,
    private authService: AuthService
  ) {
    addIcons({
      'home-outline': homeOutline,
      'barbell-outline': barbellOutline,
      'time-outline': timeOutline,
      'people-outline': peopleOutline,
      'person-outline': personOutline
    });
  }

  ionViewWillEnter() {
    const usuario = this.authService.obterSessao();
    if (!usuario.id) return;
    this.conviteService.listarPendentes(usuario.id).subscribe(convites => {
      this.convitesPendentes = convites.length;
    });
  }
}
