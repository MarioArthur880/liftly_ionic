import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonItem, IonInput, IonLabel, IonIcon, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { ToastController, NavController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, logOutOutline, saveOutline, closeCircleOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { UsuarioModel } from '../../model/usuario.model';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonLabel, IonInput, IonItem, IonButton, IonSelect, IonSelectOption,
    IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule
  ]
})
export class PerfilPage implements OnInit {

  usuario: UsuarioModel;
  formGroup: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController,
    private navController: NavController
  ) {
    addIcons({
      'person-circle-outline': personCircleOutline,
      'log-out-outline': logOutOutline,
      'save-outline': saveOutline,
      'close-circle-outline': closeCircleOutline
    });
    this.usuario = new UsuarioModel();
    this.formGroup = this.formBuilder.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      dataNascimento: [''],
      peso: [null, [Validators.min(30), Validators.max(300)]],
      altura: [null, [Validators.min(100), Validators.max(250)]],
      objetivo: ['']
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuario = this.authService.obterSessao();
    this.formGroup.patchValue({
      nome: this.usuario.nome,
      email: this.usuario.email,
      dataNascimento: this.usuario.dataNascimento || '',
      peso: this.usuario.peso || null,
      altura: this.usuario.altura || null,
      objetivo: this.usuario.objetivo || ''
    });
  }

  salvar() {
    const valores = this.formGroup.getRawValue();
    this.usuario.nome = valores.nome;
    this.usuario.dataNascimento = valores.dataNascimento;
    this.usuario.peso = valores.peso ? Number(valores.peso) : null;
    this.usuario.altura = valores.altura ? Number(valores.altura) : null;
    this.usuario.objetivo = valores.objetivo;
    this.authService.atualizarUsuario(this.usuario);
    this.exibirMensagem('Perfil atualizado com sucesso!');
  }

  sair() {
    this.authService.limparSessao();
    this.navController.navigateRoot('/home');
  }

  async confirmarDesativar() {
    const alert = await this.alertController.create({
      header: 'Desativar conta',
      message: 'Tem certeza que deseja desativar sua conta? Você não conseguirá mais fazer login.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desativar',
          role: 'destructive',
          handler: () => {
            this.authService.desativarConta(this.usuario.id);
            this.navController.navigateRoot('/home');
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1800,
      position: 'bottom'
    });
    toast.present();
  }
}
