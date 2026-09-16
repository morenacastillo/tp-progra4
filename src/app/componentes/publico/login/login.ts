import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../servicios/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  formulario = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
  });

  error = signal('');
  cargando = signal(false);
  
  constructor(private auth: Auth, private router: Router) {}

  async login() {
    if (this.formulario.invalid) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const valores = this.formulario.getRawValue();

    const { error } = await this.auth.signIn(valores.email, valores.password);

    if (error) {
      this.cargando.set(false);
      this.error.set(error.message);
      return;
    }

    const usuario = await this.auth.getCurrentUser();

    this.cargando.set(false);

    this.router.navigate([this.auth.obtenerRutaHomePorRol(usuario?.rol)]);
  }
}

