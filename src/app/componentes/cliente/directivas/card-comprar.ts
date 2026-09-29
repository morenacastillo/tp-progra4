import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appCardComprar]',
  host: {
    '(mouseenter)': 'activo.set(true)',
    '(mouseleave)': 'activo.set(false)',
    '[class.hover-activo]': 'activo()',
  },
})
export class CardComprar {
  activo = signal(false);
}