import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Salas } from '../../../servicios/salas';
import { DatosButacas } from '../../../modelos/datos-butacas';

@Component({
  imports: [],
  selector: 'app-mapa-butacas',
  styleUrl: './mapa-butacas.css',
  templateUrl: './mapa-butacas.html',
})
export class MapaButacas implements OnInit, OnDestroy {
  butacas = signal<DatosButacas[]>([]);
  filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];

  private suscripcion?: Subscription;

  constructor(private route: ActivatedRoute, private salasService: Salas) {}

  ngOnInit() {
    this.suscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.cargarButacas(Number(id));
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  private async cargarButacas(salaId: number) {
    const datos = await this.salasService.obtenerButacas(salaId);
    this.butacas.set(datos);
  }

  butacasDeFila(fila: string) {
    return this.butacas().filter(b => b.fila === fila);
  }
}