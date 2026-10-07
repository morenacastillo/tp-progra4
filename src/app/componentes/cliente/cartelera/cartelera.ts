import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { FiltroPipe } from '../pipes/filtro-pipe';
import { GetPelicula, GENEROS } from '../../../modelos/datos-pelicula';
import { GeneroPipe } from '../pipes/genero-pipe';

@Component({
  imports: [CartaPelicula, FormsModule, FiltroPipe, GeneroPipe],  
  selector: 'app-cartelera',
  styleUrl: './cartelera.css',
  templateUrl: './cartelera.html',
})
export class Cartelera implements OnInit {
    peliculas = signal<GetPelicula[]>([]);
    busqueda = signal('');
    generos = GENEROS;
    genero = signal('');  

    constructor(private peliculasService: Peliculas) {}

    ngOnInit() {
      this.cargarPeliculas();
    }

    private async cargarPeliculas() {
      const datos = await this.peliculasService.obtenerPeliculas();
      let activas: GetPelicula[] = [];
      for (let pelicula of datos) {
        if (pelicula.estado && pelicula.etapa === 'Cartelera') {
          activas.push(pelicula);
        }
      }
      this.peliculas.set(activas);
    }
  }