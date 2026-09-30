import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Carrito } from '../servicios/carrito';

export const funcionElegida: CanActivateFn = (route, state) => {
  const carrito = inject(Carrito)
  const router = inject(Router);
  const funcion = carrito.funcion()
  const idUrl = Number(route.paramMap.get('id'));

  if (funcion && funcion.id === idUrl){
    return true
  }
  router.navigate(['/home-cliente/cartelera']);
  return false;
};
