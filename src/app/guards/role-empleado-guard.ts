import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { Auth } from '../servicios/auth';


export const roleEmpleado: CanMatchFn = async (route, segments) => {

  const auth = inject(Auth);
  const user = await auth.getCurrentUser();

  if (!user || user.rol !== 'empleado') {
    return false;
  }
  return true;
};
