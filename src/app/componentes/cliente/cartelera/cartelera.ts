import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { FiltroPipe } from '../pipes/filtro-pipe';
import { GetPelicula } from '../../../modelos/datos-pelicula';

@Component({
  imports: [CartaPelicula, FormsModule, FiltroPipe],
  selector: 'app-cartelera',
  styleUrl: './cartelera.css',
  templateUrl: './cartelera.html',
})
export class Cartelera implements OnInit {
    peliculas = signal<GetPelicula[]>([]);
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