import { Component, signal } from '@angular/core';
import { GetActividad } from '../../../modelos/datos-actividad';
import { Actividad } from '../../../servicios/actividad';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-log-actividad',
  styleUrl: './log-actividad.css',
  templateUrl: './log-actividad.html',
})
export class LogActividad {
  logs = signal<GetActividad[]>([]);

  constructor(private serviceActividad: Actividad) {}
  
  ngOnInit() {
    this.cargarLogs();
  }
    
  private async cargarLogs() {
    const datos = await this.serviceActividad.obtenerLogs();
    this.logs.set(datos);
  }
}
