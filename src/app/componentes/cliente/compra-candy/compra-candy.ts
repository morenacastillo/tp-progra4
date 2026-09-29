import { Component, OnInit, signal } from '@angular/core';
import { Candy } from '../../../servicios/candy';
import { GetProducto } from '../../../modelos/datos-candy';
import { GetCombo } from '../../../modelos/datos-combos';
import { CartaCandy } from '../carta-candy/carta-candy';
import { Combos } from '../../../servicios/combos';
import { Carrito } from '../../../servicios/carrito';
import { ResumenCarrito } from '../resumen-carrito/resumen-carrito';

@Component({
  imports: [CartaCandy, ResumenCarrito],
  selector: 'app-candy',
  styleUrl: './compra-candy.css',
  templateUrl: './compra-candy.html',
})
export class CompraCandy implements OnInit{

  productosCandy = signal<GetProducto[]>([]);
  combosCandy = signal<GetCombo[]>([]);

  constructor(private candyServices: Candy, private combosServices: Combos, private carrito: Carrito) {}

  ngOnInit() {
    this.cargarCandyProductos();
    this.cargarCombos();
  }

  private async cargarCandyProductos() {
      const datos = await this.candyServices.obtenerProductos();
      this.productosCandy.set(datos.filter(p => p.estado));
  }

  private async cargarCombos() {
    const datos = await this.combosServices.obtenerCombos();
    this.combosCandy.set(datos.filter(c => c.estado && c.cantidad_entradas === 0));
  }

  agregarProducto(producto: GetProducto) {
    this.carrito.agregarCandy({ tipo: 'producto', id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
  }

  agregarCombo(combo: GetCombo) {
    this.carrito.agregarCandy({ tipo: 'combo', id: combo.id, nombre: combo.nombre, precio: combo.precio, cantidad: 1 });
  }
}
