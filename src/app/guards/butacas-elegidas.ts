import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Carrito } from '../servicios/carrito';

export const butacasElegidas: CanActivateFn = (route, state) => {
  const carrito = inject(Carrito);
  const router = inject(Router)

  if(carrito.butacas().length > 0) {
    return true;
  }
  router.navigate(['/home-cliente/cartelera']);
  return false;
};
