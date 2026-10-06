import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { Combos } from '../../../servicios/combos';
import { GetCombo } from '../../../modelos/datos-combos';
import { Carrito } from '../../../servicios/carrito';
import { CartaCandy } from '../carta-candy/carta-candy'
import { DatePipe } from '@angular/common';

@Component({
  imports: [CartaPelicula, CartaCandy, DatePipe, RouterLink],
  selector: 'app-home-cliente',
  styleUrl: './home-cliente.css',
  templateUrl: './home-cliente.html',
})
export class HomeCliente implements OnInit{
  masVendidas = signal<GetPelicula[]>([]);
  proximosEstrenos = signal<GetPelicula[]>([]);
  combosDestacados = signal<GetCombo[]>([]);
  enCartelera = signal<GetPelicula[]>([]);
  
  constructor(private peliculasService: Peliculas, private combosService: Combos, private carrito: Carrito, private router: Router) {}

  ngOnInit() {
    this.cargarMasVendidas();
    this.cargarProximamente();
    this.cargarCombosDestacados();
    this.cargarCartelera();
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
    let conEntradas: GetCombo[] = [];
    for (let combo of datos) {
      if (combo.estado && combo.cantidad_entradas > 0) {
        conEntradas.push(combo);
      }
    }
    this.combosDestacados.set(conEntradas);
  }

  private async cargarCartelera() {
    const datos = await this.peliculasService.obtenerPeliculas();
    let cartelera: GetPelicula[] = [];
    for (let pelicula of datos) {
      if (pelicula.estado && pelicula.etapa === 'Cartelera') {
        cartelera.push(pelicula);
      }
    }
    this.enCartelera.set(cartelera);
  }

  comprarCombo(combo: GetCombo) {
    this.carrito.elegirCombo(combo);
    this.router.navigate(['/home-cliente/cartelera']);
  }

}
