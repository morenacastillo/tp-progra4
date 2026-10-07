import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Perfil } from '../../../servicios/perfil';
import { DatosUsuario, CompraPerfil } from '../../../modelos/datos-perfil';
import { Resenas } from '../../../servicios/resenas';
import { GetResena } from '../../../modelos/datos-resenas';
import { Auth } from '../../../servicios/auth';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit{
  datosPerfil = signal<DatosUsuario | null>(null);
  datosCompras = signal<CompraPerfil[]>([]);
  resenas = signal<GetResena[]>([]);
  seccion = signal<'datos' | 'compras' | 'puntos' | 'resenas'>('datos');

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  formResenas = new FormGroup({
    pelicula_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estrellas: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    comentario: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(200)] }),
  })

  constructor(private perfilService: Perfil, private resenasService: Resenas, private auth: Auth) {}

  ngOnInit() {
    this.cargarDatosUsuarioActual()
    this.cargarComprasUsuarioActual()
    this.cargarResenasUsuarioActual()
  }

  private async cargarDatosUsuarioActual() {
    const datos = await this.perfilService.obtenerDatos()
    this.datosPerfil.set(datos)
  }

  private async cargarComprasUsuarioActual() {
    const datos = await this.perfilService.obtenerCompras()
    this.datosCompras.set(datos)
  }

  private async cargarResenasUsuarioActual() {
    const usuario = await this.auth.getCurrentUser()
    if (!usuario){
      return
    }
    const datos = await this.resenasService.obtenerResenaPorUsuario(usuario.id)
    this.resenas.set(datos)
  }

  yaOpino(peliculaId: number) {
    for (let resena of this.resenas()) {
      if (resena.pelicula_id === peliculaId) {
        return true;
      }
    }
    return false;
  }

  peliculasVistas() {
    let peliculas: { id: number; nombre: string; imagen_url: string }[] = [];
    let idsAgregados: number[] = [];

    for (let compra of this.datosCompras()) {
      const entrada = compra.entradas[0]; // toma la primer entrada de la pelicula

      if (entrada && new Date(entrada.funciones.fin) < new Date()) { // preg si la compra tiene entradas y la peli ya termino
        const pelicula = entrada.funciones.peliculas;

        if (!this.yaOpino(pelicula.id) && !idsAgregados.includes(pelicula.id)) { // si aun no opinaste de esa peli y no esta en la lista
          peliculas.push(pelicula);
          idsAgregados.push(pelicula.id);
        }
      }
    }
    return peliculas;
  }
  

  async agregarResena() {
    if (this.formResenas.invalid) {
      return;
    }

    const usuario = await this.auth.getCurrentUser();
    if (!usuario) {
      return;
    }
    
    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);
    
    const valores = this.formResenas.getRawValue()
    
    const { error } = await this.resenasService.crearResena({
      usuario_id: usuario.id,
      pelicula_id: Number(valores.pelicula_id),
      estrellas: Number(valores.estrellas),
      comentario: valores.comentario
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.guardadoOk.set(true);
    this.formResenas.reset();
    this.cargarResenasUsuarioActual();
  }

  cancelar() {
    this.formResenas.reset();
  }

}
