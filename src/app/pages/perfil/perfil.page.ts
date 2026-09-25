import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonItem, IonInput, IonLabel, IonIcon, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton
} from '@ionic/angular/standalone';
import { ToastController, NavController, AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline, logOutOutline, saveOutline, closeCircleOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { PesoService } from '../../services/peso.service';
import { UsuarioModel } from '../../model/usuario.model';
import { PesoRegistroModel } from '../../model/peso-registro.model';
import { ThemeService, TemaPreferencia } from '../../services/theme.service';

interface PontoGrafico {
  x: number;
  y: number;
  peso: number;
  data: string;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonLabel, IonInput, IonItem, IonButton, IonSelect, IonSelectOption,
    IonSegment, IonSegmentButton,
    IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule, ReactiveFormsModule
  ]
})
export class PerfilPage implements OnInit {

  usuario: UsuarioModel;
  formGroup: FormGroup;
  senhaForm: FormGroup;
  temaPreferencia: TemaPreferencia = 'sistema';
  historicoPeso: PesoRegistroModel[] = [];
  carregandoPesos = false;
  erroPesos = false;

  readonly graficoLargura = 320;
  readonly graficoAltura = 160;
  readonly graficoPadding = 28;

  constructor(
    private authService: AuthService,
    private pesoService: PesoService,
    private themeService: ThemeService,
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
    this.senhaForm = this.formBuilder.group({
      senhaAtual: ['', [Validators.required, Validators.minLength(6)]],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuario = this.authService.obterSessao();
    this.temaPreferencia = this.themeService.obterPreferencia();
    this.formGroup.patchValue({
      nome: this.usuario.nome,
      email: this.usuario.email,
      dataNascimento: this.usuario.dataNascimento || '',
      peso: this.usuario.peso ?? null,
      altura: this.usuario.altura ?? null,
      objetivo: this.usuario.objetivo || ''
    });
    this.carregarHistoricoPeso();
  }

  get imc(): number | null {
    const peso = Number(this.formGroup.get('peso')?.value);
    const alturaCm = Number(this.formGroup.get('altura')?.value);
    if (!peso || !alturaCm || peso <= 0 || alturaCm <= 0) return null;
    const alturaMetros = alturaCm / 100;
    return peso / (alturaMetros * alturaMetros);
  }

  get classificacaoImc(): { texto: string; classe: string; mensagem: string } | null {
    const valor = this.imc;
    if (valor === null) return null;
    if (valor < 18.5) return { texto: 'Abaixo da faixa de referência', classe: 'imc-amarelo', mensagem: 'Atenção: o IMC está abaixo da faixa considerada adequada.' };
    if (valor < 25) return { texto: 'Faixa adequada', classe: 'imc-verde', mensagem: 'O IMC está na faixa considerada adequada.' };
    if (valor < 30) return { texto: 'Acima da faixa de referência', classe: 'imc-amarelo', mensagem: 'O IMC está um pouco acima da faixa considerada adequada.' };
    return { texto: 'Faixa elevada', classe: 'imc-vermelho', mensagem: 'O IMC está elevado. Procure orientação de um profissional de saúde.' };
  }

  get pontosGrafico(): PontoGrafico[] {
    if (this.historicoPeso.length === 0) return [];
    const pesos = this.historicoPeso.map(r => r.peso);
    let min = Math.min(...pesos);
    let max = Math.max(...pesos);
    if (Math.abs(max - min) < 0.1) {
      min -= 1;
      max += 1;
    } else {
      const margem = Math.max((max - min) * 0.15, 0.5);
      min -= margem;
      max += margem;
    }

    const larguraUtil = this.graficoLargura - this.graficoPadding * 2;
    const alturaUtil = this.graficoAltura - this.graficoPadding * 2;
    const tempos = this.historicoPeso.map(registro => new Date(registro.dataRegistro).getTime());
    const tempoMin = Math.min(...tempos);
    const tempoMax = Math.max(...tempos);
    const intervaloTempo = tempoMax - tempoMin;
    const divisorIndice = Math.max(this.historicoPeso.length - 1, 1);

    return this.historicoPeso.map((registro, index) => {
      const tempo = tempos[index];
      const proporcaoX = intervaloTempo > 0 ? (tempo - tempoMin) / intervaloTempo : index / divisorIndice;
      return {
        x: this.graficoPadding + proporcaoX * larguraUtil,
        y: this.graficoPadding + ((max - registro.peso) / (max - min)) * alturaUtil,
        peso: registro.peso,
        data: registro.dataRegistro
      };
    });
  }

  get linhaGrafico(): string {
    return this.pontosGrafico.map(p => `${p.x},${p.y}`).join(' ');
  }

  get pesoMinGrafico(): number | null {
    return this.historicoPeso.length ? Math.min(...this.historicoPeso.map(r => r.peso)) : null;
  }

  get pesoMaxGrafico(): number | null {
    return this.historicoPeso.length ? Math.max(...this.historicoPeso.map(r => r.peso)) : null;
  }

  carregarHistoricoPeso() {
    this.carregandoPesos = true;
    this.erroPesos = false;
    this.pesoService.listar().subscribe({
      next: registros => {
        this.historicoPeso = [...registros].sort((a, b) =>
          new Date(a.dataRegistro).getTime() - new Date(b.dataRegistro).getTime());
        this.carregandoPesos = false;
      },
      error: () => {
        this.erroPesos = true;
        this.carregandoPesos = false;
      }
    });
  }

  formatarDataPeso(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  alterarSenha() {
    if (this.senhaForm.invalid) {
      this.exibirMensagem('Preencha corretamente os campos de senha.');
      return;
    }
    const { senhaAtual, novaSenha, confirmarSenha } = this.senhaForm.value;
    if (novaSenha !== confirmarSenha) {
      this.exibirMensagem('A confirmação da nova senha não confere.');
      return;
    }
    if (senhaAtual === novaSenha) {
      this.exibirMensagem('A nova senha deve ser diferente da senha atual.');
      return;
    }

    this.authService.alterarSenha(this.usuario.id, senhaAtual, novaSenha).subscribe({
      next: () => {
        this.authService.limparSessao();
        this.exibirMensagem('Senha alterada. Entre novamente com a nova senha.');
        this.navController.navigateRoot('/login');
      },
      error: (erro) => this.exibirMensagem(erro.status === 401 ? 'A senha atual está incorreta.' : 'Erro ao alterar a senha.')
    });
  }

  salvar() {
    if (this.formGroup.invalid) {
      this.exibirMensagem('Revise os dados informados.');
      return;
    }
    const valores = this.formGroup.getRawValue();
    this.usuario.nome = valores.nome;
    this.usuario.dataNascimento = valores.dataNascimento;
    this.usuario.peso = valores.peso !== null && valores.peso !== '' ? Number(valores.peso) : null;
    this.usuario.altura = valores.altura !== null && valores.altura !== '' ? Number(valores.altura) : null;
    this.usuario.objetivo = valores.objetivo;

    this.authService.atualizarUsuario(this.usuario).subscribe({
      next: usuario => {
        this.usuario = usuario;
        this.carregarHistoricoPeso();
        this.exibirMensagem('Perfil atualizado com sucesso!');
      },
      error: () => this.exibirMensagem('Erro ao atualizar perfil.')
    });
  }

  alterarTema(valor: string | number | undefined) {
    if (valor !== 'sistema' && valor !== 'claro' && valor !== 'escuro') return;
    this.temaPreferencia = valor;
    this.themeService.definirPreferencia(valor);
  }

  sair() {
    this.authService.logout().subscribe({
      next: () => this.navController.navigateRoot('/home'),
      error: () => {
        this.authService.limparSessao();
        this.navController.navigateRoot('/home');
      }
    });
  }

  async confirmarDesativar() {
    const alert = await this.alertController.create({
      header: 'Desativar conta',
      message: 'Tem certeza que deseja desativar sua conta? Você não conseguirá mais fazer login.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Desativar', role: 'destructive', handler: () => {
            this.authService.desativarConta(this.usuario.id).subscribe({
              next: () => this.navController.navigateRoot('/home'),
              error: () => this.exibirMensagem('Erro ao desativar conta.')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2200, position: 'bottom' });
    await toast.present();
  }
}
