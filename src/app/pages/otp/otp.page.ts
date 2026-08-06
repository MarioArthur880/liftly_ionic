import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonBackButton, IonButtons, IonInput
} from '@ionic/angular/standalone';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [
    IonButtons, IonBackButton, IonInput, IonButton,
    IonContent, IonHeader, IonToolbar,
    CommonModule, FormsModule
  ]
})
export class OtpPage {

  digitos: string[] = ['', '', '', '', ''];

  constructor(
    private toastController: ToastController,
    private navController: NavController
  ) {}

  onInput(event: any, index: number) {
    const val = event.target.value;
    this.digitos[index] = val.slice(-1);
    if (val && index < 4) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as any).setFocus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.digitos[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as any).setFocus();
    }
  }

  trocarSenha() {
    const codigo = this.digitos.join('');
    if (codigo.length < 5) {
      this.exibirMensagem('Digite o código completo.');
      return;
    }
    this.navController.navigateForward('/reset-senha');
  }

  reenviar() {
    this.exibirMensagem('Código reenviado!');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    toast.present();
  }
}
