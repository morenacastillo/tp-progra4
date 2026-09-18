import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../servicios/auth';

@Directive({
  selector: '[appEsEmpleado]',
})
export class EsEmpleado {
  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private auth: Auth) {
    if (this.auth.usuarioActual()?.rol === 'empleado') {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
