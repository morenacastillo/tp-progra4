import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Carrito } from '../../../servicios/carrito';
import { Compras } from '../../../servicios/compras';
import { PdfCompra } from '../../../servicios/pdf-compras';
import { Cupones } from '../../../servicios/cupones';
import { Funciones } from '../../../servicios/funciones';
import { Perfil } from '../../../servicios/perfil';
import { Auth } from '../../../servicios/auth';
import { Fechas } from '../../../servicios/fechas';

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

  constructor(public carrito: Carrito, private comprasService: Compras, private pdfService: PdfCompra,private router: Router, private cuponesService: Cupones, private funcionesService: Funciones, private perfilService: Perfil, private auth: Auth, private fechasService: Fechas) {}


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

    const texto = codigo.trim().toUpperCase(); //sin espacios y mayusculas
    if (!texto) {
      this.errorCupon.set('Ingresá un código.');
      return;
    }

    const cupon = await this.cuponesService.obtenerCuponPorCodigo(texto);

    if (!cupon) {
      this.errorCupon.set('El cupón no existe.');
      return;
    }

    if (!cupon.activo) {
      this.errorCupon.set('El cupón no está disponible.');
      return;
    }

    const hoy = this.fechasService.hoyTexto();

    if (cupon.valido_desde.slice(0, 10) > hoy) {
      this.errorCupon.set('El cupón todavía no está vigente.');
      return;
    }

    if (cupon.valido_hasta && cupon.valido_hasta.slice(0, 10) < hoy) {
      this.errorCupon.set('El cupón está vencido.');
      return;
    }

    if ((cupon.solo_primera_compra || cupon.edad_minima > 0) && !this.auth.usuarioLogueado()) {
      this.errorCupon.set('Este cupón es solo para usuarios registrados.');
      return;
    }

    if (cupon.solo_primera_compra) {
      const compras = await this.perfilService.obtenerCompras();
      if (compras.length > 0) {
        this.errorCupon.set('Este cupón solo es válido para tu primera compra.');
        return;
      }
    }

    if (cupon.edad_minima > 0) {
      const datos = await this.perfilService.obtenerDatos();
      if (!datos || this.fechasService.edad(datos.fecha_nacimiento) < cupon.edad_minima) {
        this.errorCupon.set('Este cupón es para mayores de ' + cupon.edad_minima + ' años.');
        return;
      }
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

    const funcion = this.carrito.funcion();
    if (!funcion) {
      this.procesando.set(false);
      return;
    }

    const ocupadas = await this.funcionesService.obtenerButacasOcupadas(funcion.id);

    let tomadas: string[] = [];
    for (let butaca of this.carrito.butacas()) {
      if (ocupadas.includes(butaca.id)) { // se guardan las butacas que ya ocupo otra persona
        tomadas.push(butaca.fila + butaca.columna);
      }
    }

    if (tomadas.length > 0) {
      this.procesando.set(false);
      this.error.set('Estas butacas ya fueron compradas por otra persona: ' + tomadas.join(', ') + '. Volvé y elegí otras.');
      return;
    }

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
