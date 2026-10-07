import { RouterLink } from '@angular/router';
import { Component, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FechaValidator } from '../../publico/validators/fecha-validator';
import { Auth } from '../../../servicios/auth';
import { Fechas } from '../../../servicios/fechas';
import { GetUsuarios } from '../../../modelos/datos-registro';
import { DatePipe } from '@angular/common';
import { Actividad } from '../../../servicios/actividad';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-gestion-empleados',
  styleUrl: './gestion-empleados.css',
  templateUrl: './gestion-empleados.html',
})
export class GestionEmpleados implements OnInit{
  empleados = signal<GetUsuarios[]>([])

  formUsuarios = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    fechaNacimiento: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    tipoSangre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    colorOjos: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    diasVacacionesAnio: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    rol: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  constructor(private auth: Auth, private fechasService: Fechas, private logsService: Actividad) {}

  ngOnInit() {
    this.cargarUsuarios()
  }

  private async cargarUsuarios() {
    const datos = await this.auth.obtenerUsuarios()
    let empleados: GetUsuarios[] = [];
    for (let usuario of datos) {
      if (usuario.rol === 'admin' || usuario.rol === 'empleado') {
        empleados.push(usuario);
      }
    }
    this.empleados.set(empleados);
  
  }

  async guardarEmpleado() {
    if (this.formUsuarios.invalid) {
      return;
    }
    
    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formUsuarios.getRawValue()

    const { error } = await this.auth.crearEmpleado({
      email: valores.email,
      password: valores.password,
      nombre: valores.nombre,
      apellido: valores.apellido,
      fechaNacimiento: this.fechasService.aFechaBase(valores.fechaNacimiento),
      tipoSangre: valores.tipoSangre,
      colorOjos: valores.colorOjos,
      diasVacacionesAnio: Number(valores.diasVacacionesAnio),
    }, valores.rol);

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    await this.logsService.crearLog('Crear usuario', valores.nombre + ' ' + valores.apellido + ' (' + valores.rol + ')');

    this.guardadoOk.set(true);
    this.formUsuarios.reset();
    this.cargarUsuarios()

    setTimeout(() => {
        this.guardadoOk.set(false);
      }, 2500);
    
  }
}
