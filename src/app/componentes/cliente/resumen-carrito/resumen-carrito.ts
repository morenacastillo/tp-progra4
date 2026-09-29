import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Carrito } from '../../../servicios/carrito';
import { RouterLink } from '@angular/router';


@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-resumen-carrito',
  styleUrl: './resumen-carrito.css',
  templateUrl: './resumen-carrito.html',
})
export class ResumenCarrito {

  constructor(public carrito: Carrito) {}

  nombresButacas() {
    let nombres: string[] = [];
    for (let butaca of this.carrito.butacas()) {
      nombres.push(butaca.fila + butaca.columna);
    }
    return nombres.join(', ');
  }
}

