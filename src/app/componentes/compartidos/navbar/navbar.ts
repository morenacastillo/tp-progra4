import { Component, inject } from '@angular/core';
import { EsAdmin } from '../../../directivas/es-admin';
import { EsEmpleado } from '../../../directivas/es-empleado';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [EsAdmin, EsEmpleado, RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);

  estaEnHomeAdmin = this.router.url.startsWith('/home-admin');
  estaEnHomeEmpleado = this.router.url.startsWith('/home-empleado');
}