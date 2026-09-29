import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComprar } from '../directivas/card-comprar';

@Component({
  imports: [CardComprar, RouterLink],
  selector: 'app-carta-pelicula',
  styleUrl: './carta-pelicula.css',
  templateUrl: './carta-pelicula.html',
})
export class CartaPelicula {
  id = input.required<number>();
  nombre = input.required<string>();
  imagen = input.required<string>();
}