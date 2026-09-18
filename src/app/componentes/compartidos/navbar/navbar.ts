import { Component } from '@angular/core';
import { EsAdmin } from '../../../directivas/es-admin';
import { EsEmpleado } from '../../../directivas/es-empleado';
import { RouterLink } from '@angular/router';

@Component({
  imports: [EsAdmin, EsEmpleado, RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {}
