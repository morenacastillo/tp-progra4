import { Component, OnInit, signal } from '@angular/core';
import { Peliculas } from '../../../servicios/peliculas';
import { CartaPelicula } from '../carta-pelicula/carta-pelicula';
import { GetPelicula } from '../../../modelos/datos-pelicula';


@Component({
  imports: [CartaPelicula],
  selector: 'app-home-cliente',
  styleUrl: './home-cliente.css',
  templateUrl: './home-cliente.html',
})
export class HomeCliente implements OnInit{
  masVendidas = signal<GetPelicula[]>([]);
  proximosEstrenos = signal<GetPelicula[]>([]);

  constructor(private peliculasService: Peliculas) {}

  ngOnInit() {
    this.cargarMasVendidas();
    this.cargarProximamente()
  }

  async cargarMasVendidas() {
    const datos = await this.peliculasService.obtenerTop3()
    this.masVendidas.set(datos)
  }

  async cargarProximamente() {
    const datos = await this.peliculasService.obtenerProximosEstrenos()
    this.proximosEstrenos.set(datos)
  }

}
