import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../servicios/auth';
import { PasswordValidator } from '../validators/password-validator';
import { FechaValidator } from '../validators/fecha-validator';


@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
})
export class Registro {
  formRegistro = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    tipoSangre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    colorOjos: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    diasVacacionesAnio: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
  }, PasswordValidator);

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  constructor(private auth: Auth, private router: Router) {}

  async registrar() {
    if (this.formRegistro.invalid) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formRegistro.getRawValue();

    const partes = valores.fechaNacimiento.split('/');
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);
    const fecha = new Date(anio, mes - 1, dia);

    if (fecha.getDate() !== dia) {
      this.cargando.set(false);
      this.error.set('La fecha de nacimiento no existe.');
      return;
    }

    if (fecha > new Date()) {
      this.cargando.set(false);
      this.error.set('La fecha de nacimiento no puede ser futura.');
      return;
    }

    const { error } = await this.auth.signUp({
      email: valores.email,
      password: valores.password,
      nombre: valores.nombre,
      apellido: valores.apellido,
      fechaNacimiento: partes[2] + '-' + partes[1] + '-' + partes[0],
      tipoSangre: valores.tipoSangre,
      colorOjos: valores.colorOjos,
      diasVacacionesAnio: valores.diasVacacionesAnio,
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.guardadoOk.set(true);
    this.formRegistro.reset();

    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);
  }
}
