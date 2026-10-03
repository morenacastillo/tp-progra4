import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Funciones } from '../../../servicios/funciones';
import { Peliculas } from '../../../servicios/peliculas';
import { Salas } from '../../../servicios/salas';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { GetSala } from '../../../modelos/datos-salas';
import { GetFuncion } from '../../../modelos/datos-funciones';
import { RouterLink } from '@angular/router';
import { FechaValidator } from '../../publico/validators/fecha-validator';
import { HoraValidator } from '../../publico/validators/hora-validator';


@Component({
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  selector: 'app-gestion-funciones',
  styleUrl: './gestion-funciones.css',
  templateUrl: './gestion-funciones.html',
})
export class GestionFunciones implements OnInit {
  formFunciones = new FormGroup({
    peliculaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fecha: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    hora: new FormControl('', { nonNullable: true, validators: [Validators.required, HoraValidator] }),
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
    fecha: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    hora: new FormControl('', { nonNullable: true, validators: [Validators.required, HoraValidator] }),
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

  private armarInicio(fecha: string, hora: string) {
    const partes = fecha.split('/');
    const partesHora = hora.split(':');
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);
    const inicio = new Date(anio, mes - 1, dia, Number(partesHora[0]), Number(partesHora[1]));

    if (inicio.getDate() !== dia) {
      return null;
    }
    return inicio;
  }

  private dosDigitos(numero: number) {
    return numero.toString().padStart(2, '0');
  }

  private aFechaTexto(fechaIso: string) {
    const fecha = new Date(fechaIso);
    return this.dosDigitos(fecha.getDate()) + '/' + this.dosDigitos(fecha.getMonth() + 1) + '/' + fecha.getFullYear();
  }

  private aHoraTexto(fechaIso: string) {
    const fecha = new Date(fechaIso);
    return this.dosDigitos(fecha.getHours()) + ':' + this.dosDigitos(fecha.getMinutes());
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

    const inicio = this.armarInicio(valores.fecha, valores.hora);
    if (!inicio) {
      this.error.set('Esa fecha no existe.');
      this.cargando.set(false);
      return;
    }

    if (inicio < new Date()) {
      this.error.set('No se puede crear una función en una fecha u hora que ya pasó.');
      this.cargando.set(false);
      return;
    }

    const fin = new Date(inicio.getTime() + pelicula.duracion_minutos * 60000);
    const finBloqueo = new Date(fin.getTime() + 30 * 60000);

    const funcionesExistentes = await this.funcionesService.obtenerFunciones();

    const salaLibre = this.salas().find(sala => {
      if (!sala.estado || sala.formato !== valores.formato) {
        return false;
      }
      const funcionesDeEstaSala = funcionesExistentes.filter(f => f.sala_id === sala.id);
      const choque = funcionesDeEstaSala.some(f => {
        const otroInicio = new Date(f.inicio);
        const otroFinBloqueo = new Date(f.fin_bloqueo);
        return inicio < otroFinBloqueo && otroInicio < finBloqueo;
      });
      return !choque;
    });

    if (!salaLibre) {
      this.error.set('No hay salas ' + valores.formato + ' disponibles en ese horario.');
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
      fecha: this.aFechaTexto(funcion.inicio),
      hora: this.aHoraTexto(funcion.inicio),
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
    const inicio = this.armarInicio(valores.fecha, valores.hora);
    if (!inicio) {
      this.errorEdicion.set('Esa fecha no existe.');
      this.guardandoEdicion.set(false);
      return;
    }

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
