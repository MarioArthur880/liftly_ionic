import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonItem, IonInput, IonLabel, IonBackButton, IonButtons
} from '@ionic/angular/standalone';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-esqueceu-senha',
  templateUrl: './esqueceu-senha.page.html',
  styleUrls: ['./esqueceu-senha.page.scss'],
  standalone: true,
  imports: [
    IonButtons, IonBackButton, IonLabel, IonItem, IonInput, IonButton,
    IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule
  ]
})
export class EsqueceuSenhaPage {

  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController
  ) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.email])]
    });
  }

  continuar() {
    this.exibirMensagem('Código enviado para o seu e-mail!');
    this.navController.navigateForward('/otp');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
