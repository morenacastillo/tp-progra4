import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Peliculas } from '../../../servicios/peliculas';

@Component({
  imports: [RouterLink],
  selector: 'app-detalle-pelicula',
  styleUrl: './detalle-pelicula.css',
  templateUrl: './detalle-pelicula.html',
})
export class DetallePelicula implements OnInit, OnDestroy {
  pelicula = signal<any | null>(null);
  private suscripcion?: Subscription;

  constructor(private route: ActivatedRoute, private peliculasService: Peliculas) {}

  ngOnInit() {
    this.suscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarPelicula(id);
      }
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  private async cargarPelicula(id: string) {
    const datos = await this.peliculasService.obtenerPeliculaPorId(id);
    this.pelicula.set(datos);
  }
}