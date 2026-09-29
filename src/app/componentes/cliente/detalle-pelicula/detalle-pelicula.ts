import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Peliculas } from '../../../servicios/peliculas';
import { GetPelicula } from '../../../modelos/datos-pelicula';
import { GetFuncion } from '../../../modelos/datos-funciones';
import { Funciones } from '../../../servicios/funciones';
import { DatePipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-detalle-pelicula',
  styleUrl: './detalle-pelicula.css',
  templateUrl: './detalle-pelicula.html',
})
export class DetallePelicula implements OnInit, OnDestroy {
  pelicula = signal<GetPelicula | null>(null);
  funcionPorPelicula = signal<GetFuncion[]>([]);
  private suscripcion?: Subscription;


  formPeliculaDisponibles = new FormGroup({
    formato: new FormControl<string | null>(null, { validators: [Validators.required] }),
    idioma: new FormControl<string | null>(null, { validators: [Validators.required] }),
    funcionId: new FormControl<number | null>(null, { validators: [Validators.required] }),
  });


  constructor(private route: ActivatedRoute, private peliculasService: Peliculas, private funcionesService: Funciones) {}

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
    const datos = await this.funcionesService.obtenerFuncionesPorPelicula(id)
    this.funcionPorPelicula.set(datos)
  }

  formatosDisponibles() {
    return [...new Set(this.funcionPorPelicula().map(f => f.formato))];
  }

  idiomasDisponibles() {
    const formato = this.formPeliculaDisponibles.controls.formato.value;
    return [...new Set(
      this.funcionPorPelicula()
        .filter(f => f.formato === formato)
        .map(f => f.idioma)
    )];
  }

  funcionPorPeliculaDisponibles() {
    const formato = this.formPeliculaDisponibles.controls.formato.value;
    const idioma = this.formPeliculaDisponibles.controls.idioma.value;
    return this.funcionPorPelicula().filter(f => f.formato === formato && f.idioma === idioma);
  }

  elegirFormato(formato: string) {
    this.formPeliculaDisponibles.controls.formato.setValue(formato);
    this.formPeliculaDisponibles.controls.idioma.setValue(null);
    this.formPeliculaDisponibles.controls.funcionId.setValue(null);
  }

  elegirIdioma(idioma: string) {
    this.formPeliculaDisponibles.controls.idioma.setValue(idioma);
    this.formPeliculaDisponibles.controls.funcionId.setValue(null);
  }

  elegirFuncion(funcionId: number) {
    this.formPeliculaDisponibles.controls.funcionId.setValue(funcionId);
  }

  funcionSeleccionada() {
    const id = this.formPeliculaDisponibles.controls.funcionId.value;
    return this.funcionPorPelicula().find(f => f.id === id) ?? null;
  }
  
}

