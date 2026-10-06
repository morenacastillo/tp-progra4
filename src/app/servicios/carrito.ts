import { Service, signal } from '@angular/core';
import { GetFuncion } from '../modelos/datos-funciones';
import { GetPelicula } from '../modelos/datos-pelicula';
import { GetButacas } from '../modelos/datos-butacas';
import { ItemCandyCarrito } from '../modelos/datos-carrito';
import { GetCombo } from '../modelos/datos-combos';
import { GetCupon } from '../modelos/datos-cupones';

@Service()
export class Carrito {
    pelicula = signal<GetPelicula | null>(null);
    funcion = signal<GetFuncion | null>(null);
    butacas = signal<GetButacas[]>([]);
    candy = signal<ItemCandyCarrito[]>([]);
    combo = signal<GetCombo | null>(null);
    cupon = signal<GetCupon | null>(null);

    iniciar(funcion: GetFuncion, pelicula: GetPelicula) {
        this.pelicula.set(pelicula);
        this.funcion.set(funcion);
        this.butacas.set([]);
        this.candy.set([]);
    }

    elegirButacas(butacas: GetButacas[]) {
        this.butacas.set(butacas);
    }

    elegirCombo(combo: GetCombo) {
        this.combo.set(combo);
    }

    cancelarCombo() {
        this.combo.set(null);
    }

    ingresarCupon(cupon: GetCupon) {
        this.cupon.set(cupon)
    }

    quitarCupon() {
        this.cupon.set(null)
    }

    private buscarCandy(tipo: string, id: number) {
        for (let item of this.candy()) {
            if (item.tipo === tipo && item.id === id) {
                return item;
            }
        }
        return null;
    }

    agregarCandy(item: ItemCandyCarrito) {
        const existente = this.buscarCandy(item.tipo, item.id);

        if (existente) {
            existente.cantidad = existente.cantidad + 1;
            this.candy.set([...this.candy()]);
            return;
        }

        this.candy.set([...this.candy(), item]); // si no existe, lo agrega a la lista
    }

    restarCandy(tipo: string, id: number) {
        const existente = this.buscarCandy(tipo, id);
        if (!existente) {
            return;
        }

        if (existente.cantidad > 1) {
            existente.cantidad = existente.cantidad - 1;
            this.candy.set([...this.candy()]);
            return;
        }

        let restantes: ItemCandyCarrito[] = [];
        for (let item of this.candy()) {
            if (item !== existente) {
                restantes.push(item);
            }
        }
        this.candy.set(restantes);
    }


    precioButaca(butaca: GetButacas) {
        const pelicula = this.pelicula();
        if (!pelicula) {
            return 0;
        }
        if (butaca.tipo === 'vip') {
            return pelicula.precio_vip;
        }
        return pelicula.precio_base;
    }

    totalEntradas() {
        const combo = this.combo();
        if (combo) {
            return combo.precio;
        }

        let total = 0;
        for (let butaca of this.butacas()) {
            total = total + this.precioButaca(butaca);
        }
        return total;
    }

    totalCandy() {
        let total = 0;
        for (let item of this.candy()) {
            total = total + item.precio * item.cantidad;
        }
        return total;
    }

    subtotal() {
    return this.totalEntradas() + this.totalCandy();
    }

    descuento() {
        const cupon = this.cupon();
        if (!cupon) {
            return 0;
        }
        return this.subtotal() * cupon.porcentaje_descuento / 100;
    }

    total() {
        return this.subtotal() - this.descuento();
    }

    vaciar() {
        this.funcion.set(null);
        this.pelicula.set(null);
        this.combo.set(null);
        this.butacas.set([]);
        this.candy.set([]);
        this.cupon.set(null);
    }

}
