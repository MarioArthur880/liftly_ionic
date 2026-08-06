import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonInput, IonIcon
} from '@ionic/angular/standalone';
import { ToastController, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, logoGoogle } from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonInput, IonButton,
    IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class LoginPage {

  formGroup: FormGroup;
  senhaVisivel = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService
  ) {
    addIcons({ 'eye-outline': eyeOutline, 'eye-off-outline': eyeOffOutline, 'logo-google': logoGoogle });
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  autenticar() {
    const { email, senha } = this.formGroup.value;
    this.authService.autenticar(email, senha).subscribe({
      next: () => this.navController.navigateRoot('/tabs/dashboard'),
      error: () => this.exibirMensagem('E-mail ou senha incorretos.')
    });
  }

  toggleSenha() {
    this.senhaVisivel = !this.senhaVisivel;
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
