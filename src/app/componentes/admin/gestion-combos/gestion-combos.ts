import { RouterLink } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Combos } from '../../../servicios/combos';
import { Candy } from '../../../servicios/candy';
import { GetCombo, ItemCombo } from '../../../modelos/datos-combos';
import { GetProducto } from '../../../modelos/datos-candy';
import { CurrencyPipe } from '@angular/common';
import { Actividad } from '../../../servicios/actividad';

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
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
  })

  formItem = new FormGroup({ // agregar productos
    producto_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cantidad: new FormControl('1', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  })

  formEdicion = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    estado: new FormControl(true, { nonNullable: true }),
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
  })

  comboEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  constructor(private combosService: Combos, private candyService: Candy, private logsService: Actividad) {}

  ngOnInit() {
    this.cargarCombos();
    this.cargarProductos();
  }

  private async cargarCombos() {
    const datos = await this.combosService.obtenerCombos();
    this.combos.set(datos);
  }

  private async cargarProductos() {
    const datos = await this.candyService.obtenerProductos();
    let activos: GetProducto[] = [];
    for (let producto of datos) {
      if (producto.estado) {
        activos.push(producto);
      }
    }
    this.productos.set(activos);
  }

  private buscarProducto(productoId: number) {
    for (let producto of this.productos()) {
      if (producto.id === productoId) {
        return producto;
      }
    }
    return null;
  }

  private estaEnElCombo(productoId: number) {
    for (let item of this.itemsCombo()) {
      if (item.producto_id === productoId) {
        return true;
      }
    }
    return false;
  }


  agregarItem() {
    if (this.formItem.invalid) {
      return;
    }

    const valores = this.formItem.getRawValue();
    const producto = this.buscarProducto(Number(valores.producto_id)); //recorre la tabla hasta que el id del prod ingresado matchee con una fila y la guarda en producto (solo esa fila)

    if (!producto) {
      return;
    }

    if (this.estaEnElCombo(producto.id)) { // recorre la lista de itemsCombo y si ya existe guardado el mismo id del producto que yo estoy seleccionando, te saca
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
    let restantes: ItemCombo[] = []; // arma lista nueva con todos los productos menos el del id seleccionado
    for (let item of this.itemsCombo()) {
      if (item.producto_id !== productoId) {
        restantes.push(item);
      }
    }
    this.itemsCombo.set(restantes);
  }


  async guardar() {
    if (this.formCombos.invalid || this.itemsCombo().length === 0) {
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);

    const valores = this.formCombos.getRawValue();

    const { data, error } = await this.combosService.crearCombo({
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      cantidad_entradas: Number(valores.cantidad_entradas),
      imagen_url: valores.imagen_url,
    });

    if (error || !data) {
      this.cargando.set(false);
      this.error.set(error?.message ?? 'No se pudo crear el combo.');
      return;
    }

    for (const item of this.itemsCombo()) {
      const { error: errorItem } = await this.combosService.agregarProductoACombo({
        combo_id: data.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad
      });

      if (errorItem) {
        await this.combosService.cambiarEstadoCombo(data.id, false);
        this.cargando.set(false);
        this.error.set('El combo se creó pero falló al agregar ' + item.nombre + ', así que quedó desactivado. ' + errorItem.message);
        this.cargarCombos();
        return;
      }
    }

    this.cargando.set(false);
    await this.logsService.crearLog('Crear combo', valores.nombre);

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
      imagen_url: combo.imagen_url,
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
    // a los combos ya existentes no se le cambian los productos
    const { error } = await this.combosService.actualizarCombo(combo.id, {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      estado: valores.estado,
      imagen_url: valores.imagen_url,
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    if (combo.precio !== Number(valores.precio)) {
      await this.logsService.crearLog('Modificar precio', combo.nombre + ': de ' + combo.precio + ' a ' + Number(valores.precio));
    } else {
      await this.logsService.crearLog('Modificar combo', combo.nombre);
    }

    this.comboEditandoId.set(null);
    this.cargarCombos();
  }

  async desactivar(combo: GetCombo) {
    const { error } = await this.combosService.cambiarEstadoCombo(combo.id, false);
    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }
    await this.logsService.crearLog('Desactivar combo', combo.nombre);

    this.cargarCombos();
  }

  async activar(combo: GetCombo) {
    const { error } = await this.combosService.cambiarEstadoCombo(combo.id, true);
    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }
    await this.logsService.crearLog('Activar combo', combo.nombre);

    this.cargarCombos();
  }
}