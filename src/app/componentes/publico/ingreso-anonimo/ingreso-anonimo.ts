import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../servicios/auth';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-ingreso-anonimo',
  styleUrl: './ingreso-anonimo.css',
  templateUrl: './ingreso-anonimo.html',
})
export class IngresoAnonimo {
  formulario = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  cargando = signal(false);

  constructor(private auth: Auth, private router: Router) {}

  async ingresar() {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando.set(true);

    const valores = this.formulario.getRawValue();
    this.auth.marcarIngresoAnonimo(valores.nombre, valores.apellido);

    await this.router.navigate(['/home-cliente']);

    this.cargando.set(false);
  }
}
