import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../_services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Interceptor - Token:', token);

  if (req.url.includes('/signup')) {
    return next(req);
  }

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    console.log(
      'Interceptor - Added Authorization header:',
      clonedReq.headers.get('Authorization')
    );
    return next(clonedReq);
  }

  console.log('Interceptor - No token available');
  return next(req);
};
