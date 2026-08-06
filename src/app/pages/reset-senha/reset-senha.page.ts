import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonItem, IonInput, IonLabel, IonBackButton, IonButtons, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { ToastController, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-senha',
  templateUrl: './reset-senha.page.html',
  styleUrls: ['./reset-senha.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonIcon, IonButtons, IonBackButton, IonLabel, IonItem,
    IonInput, IonButton, IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule
  ]
})
export class ResetSenhaPage {

  formGroup: FormGroup;
  senhaVisivel = false;
  confirmacaoVisivel = false;
  enviando = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController
  ) {
    addIcons({ 'eye-outline': eyeOutline, 'eye-off-outline': eyeOffOutline });
    this.formGroup = this.formBuilder.group({
      novaSenha: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmacao: ['', Validators.required]
    });
  }

  redefinir() {
    const { novaSenha, confirmacao } = this.formGroup.value;
    if (novaSenha !== confirmacao) {
      this.exibirMensagem('As senhas não coincidem.');
      return;
    }
    this.enviando = true;
    setTimeout(() => {
      this.enviando = false;
      this.exibirMensagem('Senha redefinida com sucesso!');
      this.navController.navigateRoot('/login');
    }, 2000);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
