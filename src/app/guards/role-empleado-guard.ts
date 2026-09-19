import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const roleEmpleado: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  await auth.listo;

  const user = auth.usuarioActual();

  if (!user || user.rol !== 'empleado') {
    return false;
  }
  return true;
};