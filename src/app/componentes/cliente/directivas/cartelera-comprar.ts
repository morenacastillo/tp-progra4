import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appCarteleraComprar]',
  host: {
    '(mouseenter)': 'activo.set(true)',
    '(mouseleave)': 'activo.set(false)',
    '[class.hover-activo]': 'activo()',
  },
})
export class CarteleraComprar {
  activo = signal(false);
}