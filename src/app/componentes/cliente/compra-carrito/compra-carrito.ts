import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Carrito } from '../../../servicios/carrito';
import { Compras } from '../../../servicios/compras';

@Component({
  imports: [CurrencyPipe, DatePipe, RouterLink],
  selector: 'app-compra-carrito',
  styleUrl: './compra-carrito.css',
  templateUrl: './compra-carrito.html',
})

export class CompraCarrito{
  metodosPago = ['Tarjeta de crédito', 'Tarjeta de débito', 'Mercado Pago']
  metodoPago = signal<string | null>(null);
  procesando  = signal(false)
  error = signal('')
  codigoCompra = signal<string | null>(null);

  constructor(public carrito: Carrito, private comprasService : Compras, private router: Router) {}

  nombreTipo(tipo: string) {
    if (tipo === 'vip') {
      return 'VIP';
    }
    if (tipo === 'accesible') {
      return 'Accesible';
    }
    return 'Normal';
  }

  volver() {
    const funcion = this.carrito.funcion();
    if (this.carrito.combo() && funcion) {
      this.router.navigate(['/home-cliente/butacas', funcion.id]);
    } else {
      this.router.navigate(['/home-cliente/candy']);
    }
  }

  async confirmarCompra() {
    const metodo = this.metodoPago()
    if (!metodo) {
      return;
    }

    this.procesando.set(true)
    this.error.set('')

    const compra = await this.comprasService.crearCompra(metodo)

    this.procesando.set(false)

    if(!compra) {
      this.error.set('No se pudo confirmar la compra. Intenta nuevamente')
      return
    }

    this.codigoCompra.set(compra.qr_code)
    this.carrito.vaciar()
  }




}
