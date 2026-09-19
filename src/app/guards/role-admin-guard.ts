import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const roleAdmin: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  await auth.listo;

  const user = auth.usuarioActual();

  if (!user || user.rol !== 'admin') {
    return false;
  }
  return true;
};