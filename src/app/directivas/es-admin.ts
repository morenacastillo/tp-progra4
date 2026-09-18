import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { Auth } from '../servicios/auth';

@Directive({
  selector: '[appEsAdmin]',
})
export class EsAdmin {
  constructor(private template: TemplateRef<any>, private viewContainer: ViewContainerRef, private auth: Auth) {
    if (this.auth.usuarioActual()?.rol === 'admin') {
      this.viewContainer.createEmbeddedView(this.template);
    } else {
      this.viewContainer.clear();
    }
  }
}
