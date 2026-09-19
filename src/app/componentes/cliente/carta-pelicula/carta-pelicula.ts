import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarteleraComprar } from '../directivas/cartelera-comprar';

@Component({
  imports: [CarteleraComprar, RouterLink],
  selector: 'app-carta-pelicula',
  styleUrl: './carta-pelicula.css',
  templateUrl: './carta-pelicula.html',
})
export class CartaPelicula {
  id = input.required<number>();
  nombre = input.required<string>();
  imagen = input.required<string>();
}