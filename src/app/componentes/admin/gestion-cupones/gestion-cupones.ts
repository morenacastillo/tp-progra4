import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cupones } from '../../../servicios/cupones';
import { GetCupon } from '../../../modelos/datos-cupones';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FechaValidator } from '../../publico/validators/fecha-validator';
import { Actividad } from '../../../servicios/actividad';


@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-gestion-cupones',
  styleUrl: './gestion-cupones.css',
  templateUrl: './gestion-cupones.html',
})
export class GestionCupones implements OnInit{
  
  cupones = signal<GetCupon[]>([]);
  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);

  formCupones = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    porcentaje_descuento: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(100)] }),
    solo_primera_compra: new FormControl(true, { nonNullable: true }),
    edad_minima: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(120)] }),
    valido_desde: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    valido_hasta: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
  })
  
  formEdicion = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    porcentaje_descuento: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(100)] }),
    solo_primera_compra: new FormControl(true, { nonNullable: true }),
    edad_minima: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0), Validators.max(120)] }),
    valido_desde: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    valido_hasta: new FormControl('', { nonNullable: true, validators: [Validators.required, FechaValidator] }),
    activo: new FormControl(true, { nonNullable: true }),
  })

  cuponEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private cuponesService: Cupones, private logsService: Actividad) {}
  
  ngOnInit() {
    this.cargarCupones();
    }

  async cargarCupones() {
    const datos = await this.cuponesService.obtenerCupones();
    this.cupones.set(datos);
  }

  private aFechaBase(fecha: string) {
    const partes = fecha.split('/');
    return partes[2] + '-' + partes[1] + '-' + partes[0];
  }

  private aFechaTexto(fecha: string) {
    const partes = fecha.slice(0, 10).split('-');
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }

  async guardar() {
    if (this.formCupones.invalid) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);
    

    const valores = this.formCupones.getRawValue();

    const { error } = await this.cuponesService.crearCupon({
      codigo: valores.codigo,
      descripcion: valores.descripcion,
      porcentaje_descuento: valores.porcentaje_descuento,
      solo_primera_compra: valores.solo_primera_compra,
      edad_minima: Number(valores.edad_minima),
      valido_desde: this.aFechaBase(valores.valido_desde),
      valido_hasta: this.aFechaBase(valores.valido_hasta),
    });

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    await this.logsService.crearLog('Crear cupón', valores.codigo);

    this.guardadoOk.set(true);
    this.formCupones.reset();
    this.cargarCupones()
    
    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);
  
  } 

  modificar(cupon: GetCupon) {
        this.errorEdicion.set('');
        this.cuponEditandoId.set(cupon.id);
        this.formEdicion.setValue({
          codigo: cupon.codigo,
          descripcion: cupon.descripcion,
          porcentaje_descuento: cupon.porcentaje_descuento,
          solo_primera_compra: cupon.solo_primera_compra,
          edad_minima: Number(cupon.edad_minima),
          valido_desde: this.aFechaTexto(cupon.valido_desde),
          valido_hasta: cupon.valido_hasta ? this.aFechaTexto(cupon.valido_hasta) : '',
          activo: cupon.activo
        });
      }
  
      cancelarEdicion() {
        this.cuponEditandoId.set(null);
        this.errorEdicion.set('');
      }
  
    async guardarEdicion(cupon: GetCupon) {
      if (this.formEdicion.invalid) {
        return;
      }
  
      this.guardandoEdicion.set(true);
      this.errorEdicion.set('');

      const valores = this.formEdicion.getRawValue();
  
      const { error } = await this.cuponesService.actualizarCupon(cupon.id, {
        codigo: valores.codigo,
        descripcion: valores.descripcion,
        porcentaje_descuento: valores.porcentaje_descuento,
        solo_primera_compra: valores.solo_primera_compra,
        edad_minima: Number(valores.edad_minima),
        valido_desde: this.aFechaBase(valores.valido_desde),
        valido_hasta: this.aFechaBase(valores.valido_hasta),
        activo: valores.activo
      });
  
      this.guardandoEdicion.set(false);
  
      if (error) {
        this.errorEdicion.set(error.message);
        return;
      }
  
          await this.logsService.crearLog('Modificar cupón', cupon.codigo);

          this.cuponEditandoId.set(null);
          this.cargarCupones();
    }
  
  
    async desactivar(cupon: GetCupon) {
      const { error } = await this.cuponesService.cambiarEstadoCupon(cupon.id, false);
  
      if (error) {
        this.errorEdicion.set(error.message);
        return;
      }
  
      await this.logsService.crearLog('Desactivar cupón', cupon.codigo);

      this.cargarCupones();
    }
  
    async activar(cupon: GetCupon) {
      const { error } = await this.cuponesService.cambiarEstadoCupon(cupon.id, true);
  
      if (error) {
        this.errorEdicion.set(error.message);
        return;
      }
  
      await this.logsService.crearLog('Activar cupón', cupon.codigo);

      this.cargarCupones();
    }
  

}
