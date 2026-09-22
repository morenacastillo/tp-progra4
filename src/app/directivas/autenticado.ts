import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../servicios/auth';

@Directive({
  selector: '[appAutenticado]',
})
export class Autenticado {
  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private auth: Auth) {
    if (this.auth.usuarioLogueado()) {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}