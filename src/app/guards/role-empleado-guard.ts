import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const roleEmpleado: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  const usuario = await auth.getCurrentUser();

  if (usuario !== null && usuario.rol === 'empleado') {
    return true;
  }
  return false;
};