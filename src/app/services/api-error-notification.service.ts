import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class ApiErrorNotificationService {
  private readonly toastController = inject(ToastController);
  private lastMessage = '';
  private lastTime = 0;
  async show(message: string): Promise<void> {
    const now = Date.now();
    if (message === this.lastMessage && now - this.lastTime < 5000) return;
    this.lastMessage = message;
    this.lastTime = now;
    const toast = await this.toastController.create({ message, duration: 5000, position: 'bottom', color: 'danger',
      buttons: [{ text: 'Fechar', role: 'cancel' }] });
    await toast.present();
  }
}
