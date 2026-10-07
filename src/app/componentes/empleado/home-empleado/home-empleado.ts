import { Component, signal } from '@angular/core';
import { EscanearCompras } from '../../../servicios/escanear-compras';
import { CompraEscaneo } from '../../../modelos/datos-escaneo';
import { Actividad } from '../../../servicios/actividad';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-home-empleado',
  styleUrl: './home-empleado.css',
  templateUrl: './home-empleado.html',
})
export class HomeEmpleado {
  errorCodigo = signal('')
  compra = signal<CompraEscaneo | null>(null);

  constructor(private escanearCompraService: EscanearCompras, private logsService: Actividad) {}

  async cargarCompraPorCodigo(codigo: string) {
    this.errorCodigo.set('')
    this.compra.set(null);
    const texto = codigo.trim().toUpperCase();

    if (!texto) {
      this.errorCodigo.set('Ingresá un código.');
      return;
    }

    const codigoQr = await this.escanearCompraService.obtenerCompraPorCodigo(texto)

    if (!codigoQr) {
      this.errorCodigo.set('No existe una compra con ese código.');
      return;
    }

    if (codigoQr.estado === 'cancelada') {
      this.errorCodigo.set('Esta compra fue cancelada.');
      return;
    }

    const entrada = codigoQr.entradas[0];
    if(!entrada) {
      this.errorCodigo.set('La compra no tiene entradas.');
      return;
    }

    const ahora = new Date()
    const inicio = new Date(entrada.funciones.inicio)
    const fin = new Date(entrada.funciones.fin)
    const apertura = new Date(inicio.getTime() - 60 * 60000);

    if(ahora < apertura) {
      this.errorCodigo.set('Todavía no se puede validar: la función es el ' + inicio.toLocaleString('es-AR') + '.');
      return;
    }

    if(ahora > fin) {
      this.errorCodigo.set('La función de esta compra ya terminó.');
      return;
    }
    
    this.compra.set(codigoQr)
  }


  yaValidada() {
    const compra = this.compra();
    if (!compra) {
      return false;
    }

    for (let entrada of compra.entradas) {
      if (entrada.estado === 'vigente') {
        return false;
      }
    }

    for (let item of compra.candy_vendido) {
      if (item.estado === 'vigente') {
        return false;
      }
    }
    return true;
  }


  async validarCompraEmpleado() {
    const compra = this.compra();
    if (!compra) {
      return;
    }

    if (this.yaValidada()) {
      return;
    }

    const { error } = await this.escanearCompraService.validarCompra(compra.id);

    if (error) {
      this.errorCodigo.set(error.message);
      return;
    }

    await this.logsService.crearLog('Validar QR', compra.qr_code);

    this.cargarCompraPorCodigo(compra.qr_code);
  }

}



