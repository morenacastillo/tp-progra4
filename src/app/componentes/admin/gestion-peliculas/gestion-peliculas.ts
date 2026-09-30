import { RouterLink } from '@angular/router';
import { Component, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { CurrencyPipe, DatePipe } from '@angular/common';

const PATRON_FECHA = '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-gestion-peliculas',
  styleUrl: './gestion-peliculas.css',
  templateUrl: './gestion-peliculas.html',
})
export class GestionPeliculas implements OnInit{
  formPeliculas = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sinopsis: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(20)] }),
    imagen: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    imagenHorizontal: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    duracion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(600)] }),
    restriccionEdad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    etapa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaEstreno: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PATRON_FECHA)] }),
    precioBase: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioVip: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1)] }),
    diasPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1), Validators.max(30)] }),
  });

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);
  peliculas = signal<GetPelicula[]>([]);

  formEdicion = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    duracion: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(600)] }),
    restriccionEdad: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    fechaEstreno: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(PATRON_FECHA)] }),
    precioBase: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioVip: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioPreventa: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(1)] }),
    etapa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl<boolean>(true, { nonNullable: true, validators: [Validators.required] }),
  })

  peliculaEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.cargarPeliculas();
  }
  
  private async cargarPeliculas() {
    const datos = await this.peliculasService.obtenerPeliculas();
    this.peliculas.set(datos);
  }
  
  private aFechaBase(fecha: string) {
    const partes = fecha.split('/');
    return partes[2] + '-' + partes[1] + '-' + partes[0];
  }

  private aFechaTexto(fecha: string) {
    const partes = fecha.slice(0, 10).split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  async guardar() {
    if (this.formPeliculas.invalid) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);
    

    const valores = this.formPeliculas.getRawValue();

    const { error } = await this.peliculasService.crearPelicula({
      nombre: valores.nombre,
      sinopsis: valores.sinopsis,
      imagen_url: valores.imagen,
      imagen_horizontal_url: valores.imagenHorizontal,
      duracion_minutos: Number(valores.duracion),
      restriccion_edad: Number(valores.restriccionEdad),
      fecha_estreno: this.aFechaBase(valores.fechaEstreno),
      precio_base: Number(valores.precioBase),
      precio_vip: Number(valores.precioVip),
      precio_preventa: valores.precioPreventa ? Number(valores.precioPreventa) : null,
      dias_preventa: valores.diasPreventa ? Number(valores.diasPreventa) : null,
      etapa: valores.etapa,
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.guardadoOk.set(true);
    this.formPeliculas.reset();
    this.cargarPeliculas()
    
    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);
  
  }

  modificar(pelicula: GetPelicula) {
      this.errorEdicion.set('');
      this.peliculaEditandoId.set(pelicula.id);
      this.formEdicion.setValue({
        nombre: pelicula.nombre,
        duracion: pelicula.duracion_minutos,
        restriccionEdad: pelicula.restriccion_edad,
        fechaEstreno: this.aFechaTexto(pelicula.fecha_estreno),
        precioBase: pelicula.precio_base,
        precioVip: pelicula.precio_vip,
        precioPreventa: pelicula.precio_preventa ?? 0,
        etapa: pelicula.etapa,
        estado: pelicula.estado,
      });
    }

    cancelarEdicion() {
      this.peliculaEditandoId.set(null);
      this.errorEdicion.set('');
    }

  async guardarEdicion(pelicula: GetPelicula) {
    if (this.formEdicion.invalid) {
      return;
    }

    const valores = this.formEdicion.getRawValue();

    const { error } = await this.peliculasService.actualizarPelicula(pelicula.id, {
      nombre: valores.nombre,
      duracion: valores.duracion,
      restriccion_edad: valores.restriccionEdad,
      fecha_estreno: this.aFechaBase(valores.fechaEstreno),
      precio_base: valores.precioBase,
      precio_vip: valores.precioVip,
      precio_preventa: valores.precioPreventa,
      estado: valores.estado,
      etapa: valores.etapa,
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

        this.peliculaEditandoId.set(null);
        this.cargarPeliculas();
  }


  async desactivar(pelicula: GetPelicula) {
    const { error } = await this.peliculasService.cambiarEstadoPelicula(pelicula.id, false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarPeliculas();
  }

  async activar(pelicula: GetPelicula) {
    const { error } = await this.peliculasService.cambiarEstadoPelicula(pelicula.id, true);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarPeliculas();
  }

}
