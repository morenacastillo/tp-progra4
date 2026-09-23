import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const roleAdmin: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  const usuario = await auth.getCurrentUser();

  if (usuario !== null && usuario.rol === 'admin') {
    return true;
  }
  return false;
};