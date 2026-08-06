import { Injectable } from '@angular/core';

export type TemaPreferencia = 'sistema' | 'claro' | 'escuro';

const TEMA_KEY = 'liftly_tema';
const CLASSE_ESCURO = 'ion-palette-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.aplicarTema(this.obterPreferencia());

    this.mediaQuery.addEventListener('change', () => {
      if (this.obterPreferencia() === 'sistema') {
        this.aplicarTema('sistema');
      }
    });
  }

  obterPreferencia(): TemaPreferencia {
    return (localStorage.getItem(TEMA_KEY) as TemaPreferencia) || 'sistema';
  }

  definirPreferencia(preferencia: TemaPreferencia): void {
    localStorage.setItem(TEMA_KEY, preferencia);
    this.aplicarTema(preferencia);
  }

  private aplicarTema(preferencia: TemaPreferencia): void {
    const escuro = preferencia === 'escuro' || (preferencia === 'sistema' && this.mediaQuery.matches);
    document.documentElement.classList.toggle(CLASSE_ESCURO, escuro);
  }
}
