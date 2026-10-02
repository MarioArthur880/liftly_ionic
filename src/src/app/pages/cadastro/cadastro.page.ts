import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonInput, IonIcon, IonCheckbox
} from '@ionic/angular/standalone';
import { ToastController, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, logoGoogle } from 'ionicons/icons';

import { UsuarioModel } from '../../model/usuario.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    IonCheckbox, IonIcon, IonInput, IonButton,
    IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule
  ]
})
export class CadastroPage {

  formGroup: FormGroup;
  senhaVisivel = false;
  aceitouTermos = false;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private authService: AuthService
  ) {
    addIcons({ 'eye-outline': eyeOutline, 'eye-off-outline': eyeOffOutline, 'logo-google': logoGoogle });
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      senha: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  cadastrar() {
    if (!this.aceitouTermos) {
      this.exibirMensagem('Aceite os termos para continuar.');
      return;
    }
    const usuario = new UsuarioModel();
    usuario.nome = this.formGroup.value.nome;
    usuario.email = this.formGroup.value.email;
    usuario.senha = this.formGroup.value.senha;

    this.authService.cadastrar(usuario).subscribe({
      next: () => {
        this.exibirMensagem('Conta criada com sucesso!');
        this.navController.navigateRoot('/login');
      },
      error: (erro) => {
        /* A notificação é exibida pelo interceptor da API. */
      }
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
