import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Perfil } from '../../../servicios/perfil';
import { DatosUsuario, CompraPerfil } from '../../../modelos/datos-perfil';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil implements OnInit{
  datosPerfil = signal<DatosUsuario | null>(null);
  datosCompras = signal<CompraPerfil[]>([]);
  seccion = signal<'datos' | 'compras' | 'puntos' >('datos');

  constructor(private perfilService: Perfil) {}

  ngOnInit() {
    this.cargarDatosUsuarioActual()
    this.cargarComprasUsuarioActual()
  }

  async cargarDatosUsuarioActual() {
    const datos = await this.perfilService.obtenerDatos()
    this.datosPerfil.set(datos)
  }

  async cargarComprasUsuarioActual() {
    const datos = await this.perfilService.obtenerCompras()
    this.datosCompras.set(datos)
  }
}
