import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Funciones } from '../../../servicios/funciones';
import { Peliculas } from '../../../servicios/peliculas';
import { Salas } from '../../../servicios/salas';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { GetSala } from '../../../modelos/datos-salas';
import { GetFuncion } from '../../../modelos/datos-funciones';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-gestion-funciones',
  styleUrl: './gestion-funciones.css',
  templateUrl: './gestion-funciones.html',
})
export class GestionFunciones implements OnInit {
  formFunciones = new FormGroup({
    peliculaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    inicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    formato: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    idioma: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  peliculas = signal<GetPelicula[]>([]);
  salas = signal<GetSala[]>([]);
  funciones = signal<GetFuncion[]>([]);

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  formEdicion = new FormGroup({
    inicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    formato: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    idioma: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl<boolean>(true, { nonNullable: true }),
  });

  funcionEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private funcionesService: Funciones, private peliculasService: Peliculas, private salasService: Salas) {}

  ngOnInit() {
    this.cargarPeliculas();
    this.cargarSalas();
    this.cargarFunciones();
  }

  private async cargarPeliculas() {
    const datos = await this.peliculasService.obtenerPeliculas();
    this.peliculas.set(datos);
  }

  private async cargarSalas() {
    const datos = await this.salasService.obtenerSalas();
    this.salas.set(datos);
  }

  private async cargarFunciones() {
    const datos = await this.funcionesService.obtenerFunciones();
    this.funciones.set(datos);
  }

  nombrePelicula(peliculaId: number) {
    return this.peliculas().find(p => p.id === peliculaId)?.nombre ?? '—';
  }

  nombreSala(salaId: number) {
    return this.salas().find(s => s.id === salaId)?.nombre ?? '—';
  }

  private aInputDatetime(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
  }

  async guardar() {
    if (this.formFunciones.invalid) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formFunciones.getRawValue();
    const pelicula = this.peliculas().find(p => p.id === Number(valores.peliculaId));

    if (!pelicula) {
      this.error.set('Película no encontrada.');
      this.cargando.set(false);
      return;
    }

    const inicio = new Date(valores.inicio);
    const fin = new Date(inicio.getTime() + pelicula.duracion_minutos * 60000);
    const finBloqueo = new Date(fin.getTime() + 30 * 60000);

    const funcionesExistentes = await this.funcionesService.obtenerFunciones();

    const salaLibre = this.salas().find(sala => {
      const funcionesDeEstaSala = funcionesExistentes.filter(f => f.sala_id === sala.id);
      const choque = funcionesDeEstaSala.some(f => {
        const otroInicio = new Date(f.inicio);
        const otroFinBloqueo = new Date(f.fin_bloqueo);
        return inicio < otroFinBloqueo && otroInicio < finBloqueo;
      });
      return !choque;
    });

    if (!salaLibre) {
      this.error.set('No hay salas disponibles en ese horario.');
      this.cargando.set(false);
      return;
    }

    const { error } = await this.funcionesService.crearFuncion({
      pelicula_id: pelicula.id,
      sala_id: salaLibre.id,
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      fin_bloqueo: finBloqueo.toISOString(),
      formato: valores.formato,
      idioma: valores.idioma,
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.guardadoOk.set(true);
    this.formFunciones.reset();
    this.cargarFunciones();

    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);
  }

  modificar(funcion: GetFuncion) {
    this.errorEdicion.set('');
    this.funcionEditandoId.set(funcion.id);
    this.formEdicion.setValue({
      inicio: this.aInputDatetime(funcion.inicio),
      formato: funcion.formato,
      idioma: funcion.idioma,
      estado: funcion.estado,
    });
  }

  cancelarEdicion() {
    this.funcionEditandoId.set(null);
    this.errorEdicion.set('');
  }

  async guardarEdicion(funcion: GetFuncion) {
    if (this.formEdicion.invalid) {
      return;
    }

    this.guardandoEdicion.set(true);
    this.errorEdicion.set('');

    const pelicula = this.peliculas().find(p => p.id === funcion.pelicula_id);

    if (!pelicula) {
      this.errorEdicion.set('Película no encontrada.');
      this.guardandoEdicion.set(false);
      return;
    }

    const valores = this.formEdicion.getRawValue();
    const inicio = new Date(valores.inicio);
    const fin = new Date(inicio.getTime() + pelicula.duracion_minutos * 60000);
    const finBloqueo = new Date(fin.getTime() + 30 * 60000);

    const { error } = await this.funcionesService.actualizarFuncion(funcion.id, {
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      fin_bloqueo: finBloqueo.toISOString(),
      formato: valores.formato,
      idioma: valores.idioma,
      estado: valores.estado,
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.funcionEditandoId.set(null);
    this.cargarFunciones();
  }

  async desactivar(funcion: GetFuncion) {
    const { error } = await this.funcionesService.cambiarEstadoFuncion(funcion.id, false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarFunciones();
  }

  async activar(funcion: GetFuncion) {
    const { error } = await this.funcionesService.cambiarEstadoFuncion(funcion.id, true);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarFunciones();
  }
}
