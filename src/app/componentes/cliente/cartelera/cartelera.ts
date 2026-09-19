import { Component, signal } from '@angular/core';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';

@Component({
  imports: [CartaPelicula],
  selector: 'app-cartelera',
  styleUrl: './cartelera.css',
  templateUrl: './cartelera.html',
})
export class Cartelera {
    peliculas = signal<any[]>([]);

    constructor(private peliculasService: Peliculas) {
      this.cargarPeliculas();
    }

    private async cargarPeliculas() {
      const datos = await this.peliculasService.obtenerPeliculas();
      this.peliculas.set(datos);
    }
  }