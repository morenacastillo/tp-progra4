import { Component, OnInit, signal } from '@angular/core';
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
export class LogActividad implements OnInit {
  logs = signal<GetActividad[]>([]);

  constructor(private logsService: Actividad) {}
  
  ngOnInit() {
    this.cargarLogs();
  }
    
  private async cargarLogs() {
    const datos = await this.logsService.obtenerLogs();
    this.logs.set(datos);
  }
}
