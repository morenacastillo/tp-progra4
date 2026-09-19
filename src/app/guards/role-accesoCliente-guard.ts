import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const accesoCliente: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  await auth.listo;

  if (auth.usuarioActual()) return true;
  if (auth.ingresoAnonimo()) return true;

  return false;
};