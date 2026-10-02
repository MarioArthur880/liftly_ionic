import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton,
  IonIcon, IonBackButton, IonList, IonItem, IonLabel, IonTextarea, IonModal
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { personAddOutline, keyOutline, flameOutline, trophyOutline, chatbubbleEllipsesOutline, sendOutline, imageOutline, closeOutline } from 'ionicons/icons';

import { GrupoDetalheModel } from '../../model/grupo.model';
import { MensagemModel } from '../../model/mensagem.model';
import { AuthService } from '../../services/auth.service';
import { GrupoService } from '../../services/grupo.service';
import { novaChaveEnvio } from '../../services/envio-key';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-grupo-detalhe',
  templateUrl: './grupo-detalhe.page.html',
  styleUrls: ['./grupo-detalhe.page.scss'],
  standalone: true,
  imports: [
    IonModal, IonTextarea, IonLabel, IonItem, IonList, IonIcon, IonButton, IonButtons,
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
  foto: string | null = null;
  preparandoFoto = false;
  fotoAberta: string | null = null;
  @ViewChild('listaChat') listaChat?: ElementRef<HTMLDivElement>;
  private envioPendente: { texto: string; imagem: string | null; chave: string } | null = null;
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
      'send-outline': sendOutline, 'image-outline': imageOutline, 'close-outline': closeOutline
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
        /* A notificação é exibida pelo interceptor da API. */
      }
    });
  }

  carregarMensagens(exibirLoading = false) {
    if (!this.grupoId || this.atualizandoMensagens) return;
    this.atualizandoMensagens = true;
    if (exibirLoading) this.carregandoMensagens = true;
    this.chatService.listar(this.grupoId).subscribe({
      next: mensagens => {
        const lista = this.listaChat?.nativeElement;
        const pertoDoFim = !lista || lista.scrollHeight - lista.scrollTop - lista.clientHeight < 80;
        this.mesclarMensagens(mensagens);
        if (pertoDoFim || exibirLoading) this.rolarChat();
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
    if ((!texto && !this.foto) || this.enviandoMensagem || this.preparandoFoto) return;
    if (texto.length > 1000) {
      this.exibirMensagem('A mensagem deve ter no máximo 1000 caracteres.');
      return;
    }

    this.enviandoMensagem = true;
    if (!this.envioPendente || this.envioPendente.texto !== texto || this.envioPendente.imagem !== this.foto) {
      this.envioPendente = { texto, imagem: this.foto, chave: novaChaveEnvio() };
    }
    this.chatService.enviar(this.grupoId, texto, this.foto, this.envioPendente.chave).subscribe({
      next: mensagem => {
        this.mesclarMensagens([mensagem]);
        this.foto = null;
        this.envioPendente = null;
        this.rolarChat();
        this.novaMensagem = '';
        this.enviandoMensagem = false;
        this.erroChat = false;
      },
      error: () => {
        this.enviandoMensagem = false;
        /* A notificação é exibida pelo interceptor da API. */
      }
    });
  }

  private mesclarMensagens(novas: MensagemModel[]) {
    const unicas = new Map([...this.mensagens, ...novas].map(m => [m.id, m]));
    this.mensagens = [...unicas.values()].sort((a, b) =>
      new Date(a.dataEnvio).getTime() - new Date(b.dataEnvio).getTime() || a.id.localeCompare(b.id)
    ).slice(-100);
  }

  private rolarChat() {
    requestAnimationFrame(() => {
      const lista = this.listaChat?.nativeElement;
      if (lista) lista.scrollTop = lista.scrollHeight;
    });
  }

  async selecionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    input.value = '';
    if (!arquivo || this.enviandoMensagem) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 10 * 1024 * 1024) {
      this.exibirMensagem('Escolha uma foto JPEG, PNG ou WebP de até 10 MB.');
      return;
    }
    this.preparandoFoto = true;
    const url = URL.createObjectURL(arquivo);
    try {
      const imagem = new Image();
      imagem.src = url;
      await imagem.decode();
      const proporcao = Math.min(1, 1280 / Math.max(imagem.width, imagem.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagem.width * proporcao));
      canvas.height = Math.max(1, Math.round(imagem.height * proporcao));
      const contexto = canvas.getContext('2d');
      if (!contexto) throw new Error('Canvas indisponível');
      contexto.fillStyle = '#fff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
      let foto = canvas.toDataURL('image/jpeg', 0.8);
      if (foto.length > 666690) foto = canvas.toDataURL('image/jpeg', 0.55);
      if (foto.length > 666690) throw new Error('Foto muito grande');
      this.foto = foto;
    } catch {
      this.exibirMensagem('Não foi possível preparar essa foto. Escolha uma imagem menor.');
    } finally {
      URL.revokeObjectURL(url);
      this.preparandoFoto = false;
    }
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
    this.fotoAberta = null;
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
                /* A notificação é exibida pelo interceptor da API. */
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
