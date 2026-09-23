import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Funciones } from '../../../servicios/funciones';
import { Peliculas } from '../../../servicios/peliculas';
import { Salas } from '../../../servicios/salas';
import { GetPelicula } from '../../../modelos/datos-pelicula';

@Component({
  imports: [ReactiveFormsModule],
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
    subtitulado: new FormControl(false, { nonNullable: true }),
  });

  peliculas = signal<GetPelicula[]>([]);
  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  constructor(private funcionesService: Funciones, private peliculasService: Peliculas, private salasService: Salas) {}

  ngOnInit() {
    this.cargarPeliculas();
  }

  private async cargarPeliculas() {
    const datos = await this.peliculasService.obtenerPeliculas()
    this.peliculas.set(datos)
  }

  async guardar() {
    if (this.formFunciones.invalid) {
      return;
    }

    this.cargando.set(true)
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formFunciones.getRawValue()
    const pelicula = this.peliculas().find(p => p.id === Number(valores.peliculaId)) ////

    if (!pelicula) {
      this.error.set('Pelicula no encontrada');
      this.cargando.set(false);
      return;
    }

    const inicio = new Date(valores.inicio); // inicio: fecha y hs en la que arranca la peli en el cine
    const fin = new Date(inicio.getTime() + pelicula.duracion_minutos * 60000); //60.000 miliseg en 1 min de peli
    const finBloqueo = new Date(fin.getTime() + 30 * 60000)


    const salas = await this.salasService.obtenerSalas()
    const funcionesExistentes = await this.funcionesService.obtenerFunciones()

    const salaLibre = salas.find(sala => {
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
      subtitulado: valores.subtitulado,
      });

      this.cargando.set(false);
    
      if (error) {
        this.error.set(error.message);
        return;
      }

      this.guardadoOk.set(true);
      this.formFunciones.reset({ subtitulado: false });
      
      setTimeout(() => {
        this.guardadoOk.set(false);
      }, 2500);
  
    }

}


