import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Carrito } from '../../../servicios/carrito';
import { Compras } from '../../../servicios/compras';
import { PdfCompra } from '../../../servicios/pdf-compras';
import { Cupones } from '../../../servicios/cupones';

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
  errorCupon = signal('');

  constructor(public carrito: Carrito, private comprasService: Compras, private pdfService: PdfCompra,private router: Router, private cuponesServices: Cupones) {}

  private hoyTexto() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return hoy.getFullYear() + '-' + mes + '-' + dia;
  }

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

  async aplicarCupon(codigo: string) {
    this.errorCupon.set('');

    const texto = codigo.trim().toUpperCase();
    if (!texto) {
      this.errorCupon.set('Ingresá un código.');
      return;
    }

    const cupon = await this.cuponesServices.obtenerCuponPorCodigo(texto);

    if (!cupon) {
      this.errorCupon.set('El cupón no existe.');
      return;
    }

    if (!cupon.activo) {
      this.errorCupon.set('El cupón no está disponible.');
      return;
    }

    const hoy = this.hoyTexto();

    if (cupon.valido_desde.slice(0, 10) > hoy) {
      this.errorCupon.set('El cupón todavía no está vigente.');
      return;
    }

    if (cupon.valido_hasta && cupon.valido_hasta.slice(0, 10) < hoy) {
      this.errorCupon.set('El cupón está vencido.');
      return;
    }

    this.carrito.ingresarCupon(cupon);
  }

  async confirmarCompra() {
    const metodo = this.metodoPago()
    if (!metodo) {
      return;
    }

    this.procesando.set(true)
    this.error.set('')

    const compra = await this.comprasService.crearCompra(metodo)

    if (!compra) {
      this.procesando.set(false);
      this.error.set('No se pudo confirmar la compra. Intenta nuevamente');
      return;
    }

    await this.pdfService.generar(compra.qr_code, metodo);

    this.procesando.set(false);
    this.codigoCompra.set(compra.qr_code);
    this.carrito.vaciar();
  }



}
