import { Component, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  selector: 'app-gestion-peliculas',
  styleUrl: './gestion-peliculas.css',
  templateUrl: './gestion-peliculas.html',
})
export class GestionPeliculas {
  formPeliculas = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sinopsis: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(20)] }),
    imagen: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    imagenHorizontal: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    duracion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(600)] }),
    restriccionEdad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaEstreno: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precioBase: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioVip: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    precioPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1)] }),
    diasPreventa: new FormControl('', { nonNullable: true, validators: [Validators.min(1), Validators.max(30)] }),
  });

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);
  peliculas = signal<GetPelicula[]>([]);

  constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.cargarPeliculas();
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
      fecha_estreno: valores.fechaEstreno,
      precio_base: Number(valores.precioBase),
      precio_vip: Number(valores.precioVip),
      precio_preventa: valores.precioPreventa ? Number(valores.precioPreventa) : null,
      dias_preventa: valores.diasPreventa ? Number(valores.diasPreventa) : null,
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

  private async cargarPeliculas() {
    const datos = await this.peliculasService.obtenerPeliculas();
    this.peliculas.set(datos);
  }
}
