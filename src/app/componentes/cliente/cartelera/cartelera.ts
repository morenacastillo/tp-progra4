import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { FiltroPipe } from '../pipes/filtro-pipe';

@Component({
  imports: [CartaPelicula, FormsModule, FiltroPipe],
  selector: 'app-cartelera',
  styleUrl: './cartelera.css',
  templateUrl: './cartelera.html',
})
export class Cartelera implements OnInit {
    peliculas = signal<any[]>([]);
    busqueda = signal('');

    constructor(private peliculasService: Peliculas) {}

    ngOnInit() {
      this.cargarPeliculas();
    }

    private async cargarPeliculas() {
      const datos = await this.peliculasService.obtenerPeliculas();
      this.peliculas.set(datos);
    }
  }