import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardComprar } from '../directivas/card-comprar';

@Component({
  imports: [CardComprar, CurrencyPipe],
  selector: 'app-carta-candy',
  styleUrl: './carta-candy.css',
  templateUrl: './carta-candy.html',
})

export class CartaCandy {
  nombre = input.required<string>();
  imagen = input.required<string | null>();
  descripcion = input.required<string>();
  precio = input.required<number>();

  textoBoton = input('Agregar');
  elegido = output<void>();
}