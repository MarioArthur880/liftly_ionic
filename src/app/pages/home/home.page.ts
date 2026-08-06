import { Component } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton]
})
export class HomePage {

  constructor(private navController: NavController) {}

  irParaLogin() {
    this.navController.navigateForward('/login');
  }

  irParaCadastro() {
    this.navController.navigateForward('/cadastro');
  }
}
