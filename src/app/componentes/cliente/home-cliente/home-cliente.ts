import { Component, OnInit, signal } from '@angular/core';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { Combos } from '../../../servicios/combos';
import { GetCombo } from '../../../modelos/datos-combos';
import { Router } from '@angular/router';
import { Carrito } from '../../../servicios/carrito';
import { CartaCandy } from '../carta-candy/carta-candy';


@Component({
  imports: [CartaPelicula, CartaCandy],
  selector: 'app-home-cliente',
  styleUrl: './home-cliente.css',
  templateUrl: './home-cliente.html',
})
export class HomeCliente implements OnInit{
  masVendidas = signal<GetPelicula[]>([]);
  proximosEstrenos = signal<GetPelicula[]>([]);
  combosDestacados = signal<GetCombo[]>([]);

  constructor(private peliculasService: Peliculas, private combosService: Combos,
              private carrito: Carrito, private router: Router) {}
  ngOnInit() {
    this.cargarMasVendidas();
    this.cargarProximamente()
    this.cargarCombosDestacados();
  }

  private async cargarMasVendidas() {
    const datos = await this.peliculasService.obtenerTop3()
    this.masVendidas.set(datos)
  }

  private async cargarProximamente() {
    const datos = await this.peliculasService.obtenerProximosEstrenos()
    this.proximosEstrenos.set(datos)
  }

  private async cargarCombosDestacados() {
    const datos = await this.combosService.obtenerCombos();
    this.combosDestacados.set(datos.filter(c => c.estado && c.cantidad_entradas > 0));
  }

  comprarCombo(combo: GetCombo) {
    this.carrito.elegirCombo(combo);
    this.router.navigate(['/home-cliente/cartelera']);
  }

}
