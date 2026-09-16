import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';


export const roleCliente: CanMatchFn = async (route, segments) => {
  
  const auth = inject(Auth);
  const user = await auth.getCurrentUser();

  if (!user || user.rol !== 'cliente') {
    return false;
  }
  return true;
};
