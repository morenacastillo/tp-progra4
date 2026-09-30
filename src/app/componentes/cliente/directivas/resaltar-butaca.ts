import { Directive, signal } from '@angular/core';

@Directive({
  selector: '[appResaltarButaca]',
  host: {
      '(mouseenter)': 'activo.set(true)',
      '(mouseleave)': 'activo.set(false)',
      '[class.resaltada]': 'activo()',
    },
})
export class ResaltarButaca {
  activo = signal(false);
}