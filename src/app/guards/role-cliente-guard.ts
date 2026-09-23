import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';

export const roleCliente: CanMatchFn = async (route, segments) => {
  const auth = inject(Auth);
  const usuario = await auth.getCurrentUser();

  if (usuario !== null || auth.ingresoAnonimo()){
    return true;
  } 
  return false;
};