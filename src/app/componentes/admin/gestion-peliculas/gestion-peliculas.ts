import { RouterLink } from '@angular/router';
import { Component, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { GetPelicula, GENEROS } from '../../../modelos/datos-pelicula';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FechaValidator } from '../../publico/validators/fecha-validator';
import { Actividad } from '../../../servicios/actividad';
import { Fechas } from '../../../servicios/fechas';


@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-gestion-peliculas',
  styleUrl: './gestion-peliculas.css',
  templateUrl: './gestion-peliculas.html',
})
export class GestionPeliculas implements OnInit{
  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);
  peliculas = signal<GetPelicula[]>([]);
  generos = GENEROS;
  generosElegidos = signal<string[]>([])
  
  formPeliculas = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sinopsis: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(20)] }),
    imagen: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    imagenHorizontal: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    duracion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(600)] }),
    restriccionEdad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    etapa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaEstreno: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    precioBase: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioVip: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1)] }),
    diasPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1), Validators.max(30)] }),
  });

  formGenero = new FormGroup({
    genero: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  })

  formEdicion = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    duracion: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(600)] }),
    restriccionEdad: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required] }),
    fechaEstreno: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    precioBase: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioVip: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioPreventa: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    etapa: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl<boolean>(true, { nonNullable: true, validators: [Validators.required] }),
  })

  peliculaEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private peliculasService: Peliculas, private logsService: Actividad, private fechasService: Fechas) {}

  ngOnInit() {
    this.cargarPeliculas();
  }
  
  private async cargarPeliculas() {
    const datos = await this.peliculasService.obtenerPeliculas();
    this.peliculas.set(datos);
  }
  
  agregarGenero(){
    if (this.formGenero.invalid) {
      return;
    } 
    const genero = this.formGenero.getRawValue().genero

    if(this.generosElegidos().includes(genero)){
      this.error.set('Ese género ya está agregado')
      return
    }
    this.error.set('')

    this.generosElegidos.set([...this.generosElegidos(), genero])
    this.formGenero.reset()
  }

  quitarGenero(genero: string){
    let restantes: string[] = [];
    for (let elegido of this.generosElegidos()) {
      if (elegido !== genero) { // todos los generos menos el que se selecciono para quitar
        restantes.push(elegido);
      }
    }
    this.generosElegidos.set(restantes);
  }
    

  async guardar() {
    if (this.formPeliculas.invalid || this.generosElegidos().length === 0) {
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
      fecha_estreno: this.fechasService.aFechaBase(valores.fechaEstreno),
      precio_base: Number(valores.precioBase),
      precio_vip: Number(valores.precioVip),
      precio_preventa: valores.precioPreventa ? Number(valores.precioPreventa) : null,
      dias_preventa: valores.diasPreventa ? Number(valores.diasPreventa) : null,
      etapa: valores.etapa,
      generos: this.generosElegidos(),
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.guardadoOk.set(true);
    await this.logsService.crearLog('Crear película', valores.nombre);
    this.formPeliculas.reset();
    this.generosElegidos.set([]);
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
        fechaEstreno: this.fechasService.aFechaTexto(pelicula.fecha_estreno),
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

    this.guardandoEdicion.set(true);
    this.errorEdicion.set('');

    const valores = this.formEdicion.getRawValue();

    const { error } = await this.peliculasService.actualizarPelicula(pelicula.id, {
      nombre: valores.nombre,
      duracion_minutos: valores.duracion,
      restriccion_edad: valores.restriccionEdad,
      fecha_estreno: this.fechasService.aFechaBase(valores.fechaEstreno),
      precio_base: valores.precioBase,
      precio_vip: valores.precioVip,
      precio_preventa: valores.precioPreventa ? valores.precioPreventa : null,
      estado: valores.estado,
      etapa: valores.etapa,
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

        if (pelicula.precio_base !== valores.precioBase || pelicula.precio_vip !== valores.precioVip) {
          await this.logsService.crearLog('Modificar precio', pelicula.nombre + ': base ' + valores.precioBase + ', VIP ' + valores.precioVip);
        } else {
          await this.logsService.crearLog('Modificar película', pelicula.nombre);
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

    await this.logsService.crearLog('Desactivar película', pelicula.nombre);

    this.cargarPeliculas();
  }

  async activar(pelicula: GetPelicula) {
    const { error } = await this.peliculasService.cambiarEstadoPelicula(pelicula.id, true);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    await this.logsService.crearLog('Activar película', pelicula.nombre);

    this.cargarPeliculas();
  }

}
