import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/cadastro/cadastro.page').then(m => m.CadastroPage)
  },
  {
    path: 'esqueceu-senha',
    loadComponent: () => import('./pages/esqueceu-senha/esqueceu-senha.page').then(m => m.EsqueceuSenhaPage)
  },
  {
    path: 'otp',
    loadComponent: () => import('./pages/otp/otp.page').then(m => m.OtpPage)
  },
  {
    path: 'reset-senha',
    loadComponent: () => import('./pages/reset-senha/reset-senha.page').then(m => m.ResetSenhaPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'divisoes',
        loadComponent: () => import('./pages/divisoes/divisoes.page').then(m => m.DivisoesPage)
      },
      {
        path: 'historico',
        loadComponent: () => import('./pages/historico/historico.page').then(m => m.HistoricoPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'add-divisao',
    loadComponent: () => import('./pages/add-divisao/add-divisao.page').then(m => m.AddDivisaoPage)
  },
  {
    path: 'add-divisao/:id',
    loadComponent: () => import('./pages/add-divisao/add-divisao.page').then(m => m.AddDivisaoPage)
  },
  {
    path: 'executar-treino/:id',
    loadComponent: () => import('./pages/executar-treino/executar-treino.page').then(m => m.ExecutarTreinoPage)
  }
];
