import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { Salas } from '../../../servicios/salas';
import { Funciones } from '../../../servicios/funciones';
import { Carrito } from '../../../servicios/carrito';
import { getButacas } from '../../../modelos/datos-butacas';
import { ResaltarButaca } from '../directivas/resaltar-butaca';


@Component({
  imports: [CurrencyPipe, ResaltarButaca],
  selector: 'app-mapa-butacas',
  styleUrl: './mapa-butacas.css',
  templateUrl: './mapa-butacas.html',
})
export class MapaButacas implements OnInit, OnDestroy {
  butacas = signal<getButacas[]>([]);
  filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
  ocupadas = signal<number[]>([]);
  seleccionadas = signal<getButacas[]>([]);

  private suscripcion?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private salasService: Salas, private funcionesService: Funciones, public carrito: Carrito) {}

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

    const butacas = await this.salasService.obtenerButacas(funcion.sala_id);
    this.butacas.set(butacas);

    const ocupadas = await this.funcionesService.obtenerButacasOcupadas(funcion.id);
    this.ocupadas.set(ocupadas);

    this.seleccionadas.set(this.carrito.butacas());
  }

  butacasDeFila(fila: string) {
    return this.butacas().filter(b => b.fila === fila);
  }

  estaOcupada(butaca: getButacas) {
    return this.ocupadas().includes(butaca.id);
  }

  estaSeleccionada(butaca: getButacas) {
    for (let elegida of this.seleccionadas()) {
      if (elegida.id === butaca.id) {
        return true;
      }
    }
    return false;
  }

  comboElegido() {
    return this.carrito.combo();
  }

  cantidadCombo() {
    const combo = this.carrito.combo();
    if (combo) {
      return combo.cantidad_entradas;
    }
    return 0;
  }

  tocarButaca(butaca: getButacas) {
    if (!butaca.activa || this.estaOcupada(butaca)) {
      return;
    }

    if (this.estaSeleccionada(butaca)) {
      this.seleccionadas.set(this.seleccionadas().filter(b => b.id !== butaca.id));
      return;
    }

    if (this.carrito.combo() && this.seleccionadas().length >= this.cantidadCombo()) {
      return;
    }

    this.seleccionadas.set([...this.seleccionadas(), butaca]);
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

  nombresSeleccionadas() {
    let nombres: string[] = [];
    for (let butaca of this.seleccionadas()) {
      nombres.push(butaca.fila + butaca.columna);
    }
    return nombres.join(', ');
  }

  totalSeleccion() {
    let total = 0;
    for (let butaca of this.seleccionadas()) {
      total = total + this.carrito.precioButaca(butaca);
    }
    return total;
  }

  puedeContinuar() {
    const cantidad = this.seleccionadas().length;
    if (this.carrito.combo()) {
      return cantidad === this.cantidadCombo();
    }
    return cantidad > 0;
  }

  continuar() {
    if (!this.puedeContinuar()) {
      return;
    }

    this.carrito.elegirButacas(this.seleccionadas());

    if (this.carrito.combo()) {
      this.router.navigate(['/home-cliente/carrito']);
    } else {
      this.router.navigate(['/home-cliente/candy']);
    }
  }

  volver() {
    const pelicula = this.carrito.pelicula();
    if (pelicula) {
      this.router.navigate(['/home-cliente/cartelera', pelicula.id]);
    } else {
      this.router.navigate(['/home-cliente/cartelera']);
    }
  }
}