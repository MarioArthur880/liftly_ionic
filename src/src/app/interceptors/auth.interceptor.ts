import { HttpInterceptorFn } from '@angular/common/http';
import { TOKEN_KEY } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return next(req);

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
