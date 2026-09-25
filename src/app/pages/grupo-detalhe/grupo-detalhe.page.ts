import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonBackButton, IonList, IonItem, IonLabel, IonTextarea
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, keyOutline, flameOutline, trophyOutline, chatbubbleEllipsesOutline, sendOutline } from 'ionicons/icons';

import { GrupoDetalheModel } from '../../model/grupo.model';
import { MensagemModel } from '../../model/mensagem.model';
import { AuthService } from '../../services/auth.service';
import { GrupoService } from '../../services/grupo.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-grupo-detalhe',
  templateUrl: './grupo-detalhe.page.html',
  styleUrls: ['./grupo-detalhe.page.scss'],
  standalone: true,
  imports: [
    IonTextarea, IonLabel, IonItem, IonList, IonIcon, IonButton, IonButtons,
    IonBackButton, IonTitle, IonContent, IonHeader, IonToolbar,
    CommonModule, FormsModule
  ]
})
export class GrupoDetalhePage implements OnInit, OnDestroy {

  grupo: GrupoDetalheModel = new GrupoDetalheModel();
  usuarioId = '';
  grupoId = '';
  carregando = true;
  mensagens: MensagemModel[] = [];
  novaMensagem = '';
  carregandoMensagens = true;
  atualizandoMensagens = false;
  enviandoMensagem = false;
  erroChat = false;
  private intervaloChat: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private grupoService: GrupoService,
    private chatService: ChatService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      'person-add-outline': personAddOutline, 'key-outline': keyOutline,
      'flame-outline': flameOutline, 'trophy-outline': trophyOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
      'send-outline': sendOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.usuarioId = this.authService.obterSessao().id;
    this.grupoId = this.route.snapshot.paramMap.get('id') || '';
    this.carregar();
    this.iniciarAtualizacaoChat();
  }

  ionViewWillLeave() {
    this.pararAtualizacaoChat();
  }

  ngOnDestroy() {
    this.pararAtualizacaoChat();
  }

  carregar() {
    if (!this.grupoId) return;
    this.carregando = true;
    this.grupoService.buscarDetalhe(this.grupoId).subscribe({
      next: (grupo) => {
        this.grupo = grupo;
        this.carregando = false;
        this.carregarMensagens(true);
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar o grupo.');
      }
    });
  }

  carregarMensagens(exibirLoading = false) {
    if (!this.grupoId || this.atualizandoMensagens) return;
    this.atualizandoMensagens = true;
    if (exibirLoading) this.carregandoMensagens = true;
    this.chatService.listar(this.grupoId).subscribe({
      next: mensagens => {
        this.mensagens = mensagens;
        this.erroChat = false;
        this.carregandoMensagens = false;
        this.atualizandoMensagens = false;
      },
      error: () => {
        this.erroChat = true;
        this.carregandoMensagens = false;
        this.atualizandoMensagens = false;
      }
    });
  }

  enviarMensagem() {
    const texto = this.novaMensagem.trim();
    if (!texto || this.enviandoMensagem) return;
    if (texto.length > 1000) {
      this.exibirMensagem('A mensagem deve ter no máximo 1000 caracteres.');
      return;
    }

    this.enviandoMensagem = true;
    this.chatService.enviar(this.grupoId, texto).subscribe({
      next: mensagem => {
        this.mensagens = [...this.mensagens, mensagem].slice(-100);
        this.novaMensagem = '';
        this.enviandoMensagem = false;
        this.erroChat = false;
      },
      error: () => {
        this.enviandoMensagem = false;
        this.exibirMensagem('Erro ao enviar mensagem.');
      }
    });
  }

  minhaMensagem(mensagem: MensagemModel): boolean {
    return mensagem.autorId === this.usuarioId;
  }

  formatarHora(data: string): string {
    const valor = new Date(data);
    const hoje = new Date();
    const mesmaData = valor.toDateString() === hoje.toDateString();
    return valor.toLocaleString('pt-BR', mesmaData
      ? { hour: '2-digit', minute: '2-digit' }
      : { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  private iniciarAtualizacaoChat() {
    this.pararAtualizacaoChat();
    this.intervaloChat = setInterval(() => this.carregarMensagens(false), 5000);
  }

  private pararAtualizacaoChat() {
    if (this.intervaloChat) clearInterval(this.intervaloChat);
    this.intervaloChat = null;
  }

  async convidarPorEmail() {
    const alert = await this.alertController.create({
      header: 'Convidar amigo',
      message: 'Digite o e-mail cadastrado no Liftly do seu amigo.',
      inputs: [{ name: 'email', type: 'email', placeholder: 'email@exemplo.com' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Convidar',
          handler: (dados) => {
            const email = (dados.email || '').trim();
            if (!email) {
              this.exibirMensagem('Informe um e-mail válido.');
              return false;
            }
            this.grupoService.convidar(this.grupo.id, email, this.usuarioId).subscribe({
              next: () => this.exibirMensagem('Convite enviado!'),
              error: (erro) => {
                const mensagem = erro.status === 404
                  ? 'Não encontramos um usuário Liftly com esse e-mail.'
                  : erro.status === 409
                    ? 'Esse usuário já faz parte do grupo ou já possui convite pendente.'
                    : 'Erro ao enviar convite.';
                this.exibirMensagem(mensagem);
              }
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'bottom' });
    await toast.present();
  }
}
