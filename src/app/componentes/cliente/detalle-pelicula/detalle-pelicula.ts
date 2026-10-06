import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Peliculas } from '../../../servicios/peliculas';
import { Funciones } from '../../../servicios/funciones';
import { Carrito } from '../../../servicios/carrito';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { GetFuncion, GrupoFunciones } from '../../../modelos/datos-funciones';

@Component({
  imports: [DatePipe],
  selector: 'app-detalle-pelicula',
  styleUrl: './detalle-pelicula.css',
  templateUrl: './detalle-pelicula.html',
})

export class DetallePelicula implements OnInit, OnDestroy {
  pelicula = signal<GetPelicula | null>(null);
  funcionPorPelicula = signal<GetFuncion[]>([]);
  diaElegido = signal<string | null>(null);
  funcionElegida = signal<GetFuncion | null>(null);
  private suscripcion?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private peliculasService: Peliculas, private funcionesService: Funciones, private carrito: Carrito) {}

  ngOnInit() {
    this.suscripcion = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.cargarPelicula(id);
        this.cargarFuncionPorId(id);
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

  private async cargarFuncionPorId(id: string) {
    const datos = await this.funcionesService.obtenerFuncionesPorPelicula(id);
    
    const ahora = new Date()
    let futuras: GetFuncion[] = []
    for (let funcion of datos ){
      if (new Date(funcion.inicio) > ahora) {
        futuras.push(funcion)
      }
    }
    this.funcionPorPelicula.set(futuras);
  }

  diaDe(funcion: GetFuncion) {
    const fecha = new Date(funcion.inicio);
    return fecha.getDate() + '/' + (fecha.getMonth() + 1);
    //convierto el texto del inicio de pelicula UTC a una fecha legible
  }

  diasDisponibles() {
    let dias: string[] = [];
    for (let funcion of this.funcionPorPelicula()) {
      const dia = this.diaDe(funcion);
      if (!dias.includes(dia)) {
        dias.push(dia);
      }
    }
    return dias;
  }

  // filtra las funciones del día elegido y manda cada una a su grupo con agregarAGrupo
  gruposDelDia() {
    let grupos: GrupoFunciones[] = [];
    for (let funcion of this.funcionPorPelicula()) {
      if (this.diaDe(funcion) === this.diaElegido()) {
        this.agregarAGrupo(grupos, funcion);
      }
    }
    return grupos;
  } 

  // agregarAGrupo compara la nueva funcion a agregar, si el formato y idioma ya existen en una caja, agrego el nuevo horario a esa misma; si no existe todavia una caja con ese idioma y formato, creo una y agrego el horario
  private agregarAGrupo(grupos: GrupoFunciones[], funcion: GetFuncion) {
    for (let grupo of grupos) {
      if (grupo.formato === funcion.formato && grupo.idioma === funcion.idioma) {
        grupo.funciones.push(funcion);
        return;
      }
    }
    grupos.push({ formato: funcion.formato, idioma: funcion.idioma, funciones: [funcion] });
  } 


  elegirDia(dia: string) {
    this.diaElegido.set(dia);
    this.funcionElegida.set(null);
  }

  elegirFuncion(funcion: GetFuncion) {
    this.funcionElegida.set(funcion);
  }

  comboElegido() {
    return this.carrito.combo();
  }

  cancelarCombo() {
    this.carrito.cancelarCombo();
  }

  comprar() {
    const funcion = this.funcionElegida();
    const pelicula = this.pelicula();

    if (!funcion || !pelicula) {
      return;
    }

    this.carrito.iniciar(funcion, pelicula);
    this.router.navigate(['/home-cliente/butacas', funcion.id]);
  }
}