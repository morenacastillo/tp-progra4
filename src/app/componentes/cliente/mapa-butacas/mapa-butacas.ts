import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Salas } from '../../../servicios/salas';
import { Funciones } from '../../../servicios/funciones';
import { Peliculas } from '../../../servicios/peliculas';
import { Carrito } from '../../../servicios/carrito';
import { getButacas } from '../../../modelos/datos-butacas';

@Component({
  imports: [],
  selector: 'app-mapa-butacas',
  styleUrl: './mapa-butacas.css',
  templateUrl: './mapa-butacas.html',
})
export class MapaButacas implements OnInit, OnDestroy {
  butacas = signal<getButacas[]>([]);
  filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  ocupadas = signal<number[]>([]);

  private suscripcion?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private salasService: Salas,
              private funcionesService: Funciones, private peliculasService: Peliculas, private carrito: Carrito) {}

  ngOnInit() {
    this.suscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarFuncion(id);
      }  
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  private async cargarFuncion(funcionId: string) {
    const funcion = await this.funcionesService.obtenerFuncionPorId(funcionId);
    if (!funcion) {
      return;
    }

    // si se recargó la página, el carrito está vacío: lo vuelvo a armar matcheando la funcion -> pelicula
    if (this.carrito.funcion()?.id !== funcion.id) {
      const pelicula = await this.peliculasService.obtenerPeliculaPorId(String(funcion.pelicula_id));
      if (pelicula) {
        this.carrito.iniciar(funcion, pelicula);
      }
    }

    const butacas = await this.salasService.obtenerButacas(funcion.sala_id);
    this.butacas.set(butacas);

    const ocupadas = await this.funcionesService.obtenerButacasOcupadas(funcion.id);
    this.ocupadas.set(ocupadas);
  }

  butacasDeFila(fila: string) {
    return this.butacas().filter(b => b.fila === fila);
  }

  estaOcupada(butaca: getButacas) {
    return this.ocupadas().includes(butaca.id);
  }

  comboElegido() {
    return this.carrito.combo();
  }

  cantidadAElegir() {
    const combo = this.carrito.combo();
    if (combo) {
      return combo.cantidad_entradas;
    }
    return 2;
  }

  elegirButacasDePrueba() {
    const libres = this.butacas().filter(b => b.activa && !this.estaOcupada(b));
    const elegidas = libres.slice(0, this.cantidadAElegir());

    this.carrito.elegirButacas(elegidas);

    if (this.carrito.combo()) {
      this.router.navigate(['/home-cliente/carrito']);
    } else {
      this.router.navigate(['/home-cliente/candy']);
    }
  }


}