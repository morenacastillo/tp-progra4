import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Salas } from '../../../servicios/salas';
import { GetSala } from '../../../modelos/datos-salas';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-gestion-salas',
  styleUrl: './gestion-salas.css',
  templateUrl: './gestion-salas.html',
})
export class GestionSalas implements OnInit{

  formSalas = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    formato: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  })

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);
  salas = signal<GetSala[]>([]);

  formEdicion = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    formato: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    estado: new FormControl(true, { nonNullable: true })
  })

  salaEditandoId = signal<number | null>(null); 
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private salasService: Salas) {}

  ngOnInit() {
    this.cargarSalas();
  }
  
  async guardar() {
      if (this.formSalas.invalid) {
        return;
      }

      this.cargando.set(true);
      this.error.set('');
      this.guardadoOk.set(false);

      const valores = this.formSalas.getRawValue();

      const { error } = await this.salasService.crearSala({
        nombre: valores.nombre,
        formato: valores.formato
      });

      this.cargando.set(false);

      if (error) {
        this.error.set(error.message);
        return;
      }

      this.guardadoOk.set(true);
      this.formSalas.reset();
      this.cargarSalas();

      setTimeout(() => {
        this.guardadoOk.set(false);
      }, 2500);
    }
    
    
  private async cargarSalas() {
    const datos = await this.salasService.obtenerSalas();
    this.salas.set(datos);
  }

  modificar(sala: GetSala) {
    this.errorEdicion.set('');
    this.salaEditandoId.set(sala.id);
    this.formEdicion.setValue({
      nombre: sala.nombre,
      formato: sala.formato,
      estado: sala.estado
    });
  }

  cancelarEdicion() {
    this.salaEditandoId.set(null);
    this.errorEdicion.set('');
  }

  async guardarEdicion(sala: GetSala) {
    if (this.formEdicion.invalid) {
      return;
    }

    this.guardandoEdicion.set(true);
    this.errorEdicion.set('');

    const valores = this.formEdicion.getRawValue();

    const { error } = await this.salasService.actualizarSala(sala.id, valores);

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.salaEditandoId.set(null);
    this.cargarSalas();
  }
  
  
  }

