import { Directive, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { Auth } from '../servicios/auth';

@Directive({
  selector: '[appAutenticado]',
})
export class Autenticado implements OnInit {
  private templateRef = inject(TemplateRef);
  private viewContainerRef = inject(ViewContainerRef);
  private auth = inject(Auth);

  ngOnInit() {
    if (this.auth.usuarioLogueado()) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}