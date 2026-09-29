import { Service, signal } from '@angular/core';
import { GetFuncion } from '../modelos/datos-funciones';
import { GetPelicula } from '../modelos/datos-pelicula';
import { getButacas } from '../modelos/datos-butacas';
import { ItemCandyCarrito } from '../modelos/datos-carrito';
import { GetCombo } from '../modelos/datos-combos';

@Service()
export class Carrito {
    pelicula = signal<GetPelicula | null>(null);
    funcion = signal<GetFuncion | null>(null);
    butacas = signal<getButacas[]>([]);
    candy = signal<ItemCandyCarrito[]>([]);
    combo = signal<GetCombo | null>(null);

    iniciar(funcion: GetFuncion, pelicula: GetPelicula) {
        this.pelicula.set(pelicula);
        this.funcion.set(funcion);
        this.butacas.set([]);
        this.candy.set([]);
    }

    elegirButacas(butacas: getButacas[]) {
        this.butacas.set(butacas);
    }

    elegirCombo(combo: GetCombo) {
        this.combo.set(combo);
    }

    cancelarCombo() {
        this.combo.set(null);
    }

    agregarCandy(item: ItemCandyCarrito) {
        const existente = this.candy().find(i => i.tipo === item.tipo && i.id === item.id);

        if (existente) {
            existente.cantidad = existente.cantidad + 1;
            this.candy.set([...this.candy()]);
            return;
        }

        this.candy.set([...this.candy(), item]); // si no existe, lo agrega a la lista
    }

    quitarCandy(tipo: string, id: number) {
        this.candy.set(this.candy().filter(i => !(i.tipo === tipo && i.id === id))); // revisar
    }

    precioButaca(butaca: getButacas) {
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

    total() {
        return this.totalEntradas() + this.totalCandy();
    }

    vaciar() {
        this.funcion.set(null);
        this.pelicula.set(null);
        this.combo.set(null);
        this.butacas.set([]);
        this.candy.set([]);
    }

}
