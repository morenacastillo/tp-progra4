import { RouterLink } from '@angular/router';
import { Component, OnInit, signal } from '@angular/core';
import { GetCategoria, GetProducto } from '../../../modelos/datos-candy';
import { Candy } from '../../../servicios/candy';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Actividad } from '../../../servicios/actividad';


@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  selector: 'app-gestion-candy',
  styleUrl: './gestion-candy.css',
  templateUrl: './gestion-candy.html',
})
export class GestionCandy implements OnInit{

  error = signal('');
  cargando = signal(false); // control para botones/mensajes
  guardadoOk = signal(false); // control para botones/mensajes
  productos = signal<GetProducto[]>([]);
  categorias = signal<GetCategoria[]>([]);


  formProductos = new FormGroup({
    categoria_id: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    precio: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
  })
  
  productoEditandoId = signal<number | null>(null);
  errorEdicion = signal('');
  guardandoEdicion = signal(false);

  formEdicion = new FormGroup({
    categoria_id: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    imagen_url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern('^https?://.+')] }),
    estado: new FormControl(true, { nonNullable: true })
  })


  constructor(private candyServices: Candy, private logsService: Actividad) {}

    ngOnInit() {
      this.cargarCandy();
      this.cargarCategorias()
    }

    private async cargarCandy() {
      const datos = await this.candyServices.obtenerProductos();
      this.productos.set(datos);
    }

    private async cargarCategorias() {
      const datos = await this.candyServices.obtenerCategorias();
      this.categorias.set(datos);
    }

    nombreCategoria(categoriaId: number) {
      for (let categoria of this.categorias()) {
        if (categoria.id === categoriaId) {
          return categoria.nombre;
        }
      }
      return '-';
    }

    async guardar() {
        if (this.formProductos.invalid) {
        return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.guardadoOk.set(false);


    const valores = this.formProductos.getRawValue();

    const { error } = await this.candyServices.crearProducto({
      categoria_id: Number(valores.categoria_id),
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      imagen_url: valores.imagen_url,
    })

    this.cargando.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    await this.logsService.crearLog('Crear producto', valores.nombre);

    this.guardadoOk.set(true);
    this.formProductos.reset();
    this.cargarCandy()

    setTimeout(() => {
      this.guardadoOk.set(false);
    }, 2500);

  }

  modificar(producto: GetProducto) {
    this.errorEdicion.set('');
    this.productoEditandoId.set(producto.id);
    
    this.formEdicion.setValue({
      categoria_id: producto.categoria_id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen_url: producto.imagen_url,
      estado: producto.estado
    });
  }

  cancelarEdicion() {
    this.productoEditandoId.set(null);
    this.errorEdicion.set('');
  }

  async guardarEdicion(producto: GetProducto) {
    if (this.formEdicion.invalid) {
      return;
    }

    this.guardandoEdicion.set(true);
    this.errorEdicion.set('');

    const valores = this.formEdicion.getRawValue();

    const { error } = await this.candyServices.actualizarProducto(producto.id, {
      categoria_id: Number(valores.categoria_id),
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      imagen_url: valores.imagen_url,
      estado: valores.estado
    });

    this.guardandoEdicion.set(false);

    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }

    if (producto.precio !== Number(valores.precio)) {
      await this.logsService.crearLog('Modificar precio', producto.nombre + ': de ' + producto.precio + ' a ' + Number(valores.precio));
    } else {
      await this.logsService.crearLog('Modificar producto', producto.nombre);
    }

    this.productoEditandoId.set(null);
    this.cargarCandy();
  }

  async desactivar(producto: GetProducto) {
    const { error } = await this.candyServices.cambiarEstadoProducto(producto.id, false);
    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }
    await this.logsService.crearLog('Desactivar producto', producto.nombre);

    this.cargarCandy();
  }

  async activar(producto: GetProducto) {
    const { error } = await this.candyServices.cambiarEstadoProducto(producto.id, true);
    if (error) {
      this.errorEdicion.set(error.message);
      return;
    }
    await this.logsService.crearLog('Activar producto', producto.nombre);

    this.cargarCandy();
  }

}
