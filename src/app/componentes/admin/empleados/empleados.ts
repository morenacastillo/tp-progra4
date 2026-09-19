import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-gestion-usuarios',
  styleUrl: './empleados.css',
  templateUrl: './empleados.html',
})
export class Empleados {
  formUsuarios = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    mail: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tipoSangre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    colorOjos: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    diasVacacionesAnio: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    rol: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  guardar() {
    if (this.formUsuarios.invalid) {
      return;
    }

    // Todavía sin conectar a Supabase: falta resolver cómo se hace
    // el alta sin romper la sesión del admin (ver conversación pendiente).
    console.log('Datos del formulario:', this.formUsuarios.getRawValue());
  }
}
