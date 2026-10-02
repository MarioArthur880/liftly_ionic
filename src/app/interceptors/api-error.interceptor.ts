import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiErrorNotificationService } from '../services/api-error-notification.service';
import { catchError, throwError } from 'rxjs';

export function apiErrorMessage(error: HttpErrorResponse, url: string): string {
  if (error.status === 0) return 'Não foi possível conectar ao Liftly. Confira sua conexão e tente novamente.';
  if (error.error && typeof error.error.code === 'string' && typeof error.error.message === 'string') {
    return error.error.message;
  }
  switch (error.status) {
    case 400: return 'Confira os dados informados e tente novamente.';
    case 401: return url.includes('/auth/login') ? 'E-mail ou senha incorretos.'
      : url.endsWith('/senha') ? 'A senha atual está incorreta ou sua sessão expirou. Confira a senha ou entre novamente.'
      : 'Sua sessão expirou. Entre novamente para continuar.';
    case 403: return 'Você não tem permissão para realizar esta ação.';
    case 404: return url.includes('/entrar') ? 'Código de grupo inválido.' : 'O registro solicitado não foi encontrado. Atualize a página.';
    case 409: return url.includes('/cadastro') ? 'Este e-mail já está cadastrado.'
      : url.includes('/convid') ? 'Este usuário já faz parte do grupo ou possui um convite pendente.'
      : 'Esta operação entra em conflito com os dados atuais. Atualize a página e confira as informações.';
    case 413: return 'O arquivo é muito grande. Escolha uma imagem menor.';
    case 429: return 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.';
    case 502: case 503: case 504: return 'O serviço está temporariamente indisponível. Tente novamente em instantes.';
    default: return 'Não foi possível concluir a operação. Tente novamente mais tarde.';
  }
}

// A única notificação de erro HTTP, inclusive para buscas e carregamentos.
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(ApiErrorNotificationService);
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    const message = apiErrorMessage(error, req.url);
    void notifications.show(message);
    return throwError(() => error);
  }));
};
