import { Injectable } from '@angular/core';

export type TemaPreferencia = 'claro' | 'escuro';

const TEMA_KEY = 'liftly_tema';
const CLASSE_ESCURO = 'ion-palette-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor() {
    this.aplicarTema(this.obterPreferencia());
  }

  obterPreferencia(): TemaPreferencia {
    const preferencia = localStorage.getItem(TEMA_KEY);
    // New users and the former system preference start in dark mode.
    return preferencia === 'claro' ? 'claro' : 'escuro';
  }

  definirPreferencia(preferencia: TemaPreferencia): void {
    localStorage.setItem(TEMA_KEY, preferencia);
    this.aplicarTema(preferencia);
  }

  private aplicarTema(preferencia: TemaPreferencia): void {
    document.documentElement.classList.toggle(CLASSE_ESCURO, preferencia === 'escuro');
  }
}
