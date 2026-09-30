import { RouterLink } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Combos } from '../../../servicios/combos';
import { Candy } from '../../../servicios/candy';
import { GetCombo, ItemCombo } from '../../../modelos/datos-combos';
import { GetProducto } from '../../../modelos/datos-candy';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  selector: 'app-gestion-combos',
  styleUrl: './gestion-combos.css',
  templateUrl: './gestion-combos.html',
})
export class GestionCombos implements OnInit {

  error = signal('');
  cargando = signal(false);
  guardadoOk = signal(false);
  combos = signal<GetCombo[]>([]);
  productos = signal<GetProducto[]>([]);
  itemsCombo = signal<ItemCombo[]>([]);   

  formCombos = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    precio: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    cantidad_entradas: new FormControl('0', { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.pattern('^https?://.+')] }),
  })

  formItem = new FormGroup({
    producto_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cantidad: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  })

  formEdicion = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    estado: new FormControl(true, { nonNullable: true }),
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.pattern('^https?://.+')] }),
  })

  comboEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private combosServicios: Combos, private candyServicios: Candy) {}

  ngOnInit() {
    this.cargarCombos();
    this.cargarProductos();
  }

  private async cargarCombos() {
    const datos = await this.combosServicios.obtenerCombos();
    this.combos.set(datos);
  }

  private async cargarProductos() {
    const datos = await this.candyServicios.obtenerProductos();
    this.productos.set(datos.filter(p => p.estado));   
  }


  agregarItem() {
    if (this.formItem.invalid) {
      return;
    }

    const valores = this.formItem.getRawValue();
    const producto = this.productos().find(p => p.id === Number(valores.producto_id)); //recorre la tabla hasta que el id del prod ingresado matchee con una fila

    if (!producto) {
      return;
    }

    if (this.itemsCombo().find(i => i.producto_id === producto.id)) {
      this.error.set('Ese producto ya está en el combo. Quitalo y volvelo a agregar con otra cantidad.');
      return;
    }
    this.error.set('');

    this.itemsCombo.set([
      ...this.itemsCombo(), //arma una lista nueva con todo lo que ya habia + lo nuevo agregado
      { producto_id: producto.id, nombre: producto.nombre, cantidad: Number(valores.cantidad) }
    ]);
    this.formItem.reset();
  }

  quitarItem(productoId: number) {
    this.itemsCombo.set(this.itemsCombo().filter(i => i.producto_id !== productoId)); // arma lista nueva con todos los productos menos el del id seleccionado
  }


  async guardar() {
    if (this.formCombos.invalid || this.itemsCombo().length === 0) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formCombos.getRawValue();

    const { data, error } = await this.combosServicios.crearCombo({
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      cantidad_entradas: Number(valores.cantidad_entradas),
      imagen_url: valores.imagen_url || null,
    });

    if (error || !data) {
      this.cargando.set(false);
      this.error.set(error?.message ?? 'No se pudo crear el combo.');
      return;
    }

    for (const item of this.itemsCombo()) {
      const { error: errorItem } = await this.combosServicios.agregarProductoACombo({
        combo_id: data.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad
      });

      if (errorItem) {
        await this.combosServicios.cambiarEstadoCombo(data.id, false);
        this.cargando.set(false);
        this.error.set('El combo se creó pero falló al agregar ' + item.nombre + ', así que quedó desactivado. ' + errorItem.message);
        this.cargarCombos();
        return;
      }
    }

    this.cargando.set(false);
    this.guardadoOk.set(true);
    this.formCombos.reset();
    this.itemsCombo.set([]);
    this.cargarCombos();

    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);
  }


  modificar(combo: GetCombo) {
    this.errorEdicion.set('');
    this.comboEditandoId.set(combo.id);
    this.formEdicion.setValue({
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: combo.precio,
      estado: combo.estado,
      imagen_url: combo.imagen_url ?? '',
    });
  }

  cancelarEdicion() {
    this.comboEditandoId.set(null);
    this.errorEdicion.set('');
  }

  async guardarEdicion(combo: GetCombo) {
    if (this.formEdicion.invalid) {
      return;
    }

    this.guardandoEdicion.set(true);
    this.errorEdicion.set('');

    const valores = this.formEdicion.getRawValue();

    const { error } = await this.combosServicios.actualizarCombo(combo.id, {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      estado: valores.estado,
      imagen_url: valores.imagen_url || null,
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.comboEditandoId.set(null);
    this.cargarCombos();
  }

  async desactivar(combo: GetCombo) {
    const { error } = await this.combosServicios.cambiarEstadoCombo(combo.id, false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarCombos();
  }

  async activar(combo: GetCombo) {
    const { error } = await this.combosServicios.cambiarEstadoCombo(combo.id, true);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    this.cargarCombos();
  }
}