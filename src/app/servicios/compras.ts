import { Service, inject } from '@angular/core';
import { Auth } from './auth';
import { Carrito } from './carrito';
import { AltaEntrada, AltaCandyVendido } from '../modelos/datos-compras';

@Service()
export class Compras {
    private auth = inject(Auth)
    private carrito = inject(Carrito);

    async crearCompra(metodoPago: string) {
        const funcion = this.carrito.funcion();
        const combo = this.carrito.combo();
        
        if (!funcion) {
            return null;
        }
        

        //compra
        const { data: compra, error: errorCompra } = await this.auth.client()
            .from('compras')
            .insert({
                usuario_id: this.auth.usuarioActual()?.id ?? null,
                subtotal: this.carrito.subtotal(),
                total: this.carrito.total(),
                metodo_pago: metodoPago,
                qr_code: 'CC-' + Date.now(),
                cupon_id: this.carrito.cupon()?.id ?? null,
                descuento: this.carrito.descuento()
            })
            .select()
            .single();
        if (errorCompra) {
            console.error('Error creando la compra:', errorCompra);
            return null;
        }



        //entradas
        let entradas: AltaEntrada[] = [];
        for (let butaca of this.carrito.butacas()) {
            let precio = this.carrito.precioButaca(butaca);
            let comboId: number | null = null;
            if (combo) {
                precio = 0;
                comboId = combo.id;
            }
            entradas.push({
                compra_id: compra.id,
                funcion_id: funcion.id,
                butaca_id: butaca.id,
                combo_id: comboId,
                precio: precio,
            });
        }
        const { error: errorEntradas } = await this.auth.client()
            .from('entradas')
            .insert(entradas);
        if (errorEntradas) {
            console.error('Error creando las entradas:', errorEntradas);
            await this.cancelarCompra(compra.id);
            return null;
        }



        //candy
        let candy: AltaCandyVendido[] = [];
        if (combo) {
            candy.push({
                compra_id: compra.id,
                producto_id: null,
                combo_id: combo.id,
                cantidad: 1,
                precio_unitario: combo.precio,
            });
        }
        for (let item of this.carrito.candy()) {
            let productoId: number | null = null;
            let comboId: number | null = null;
            if (item.tipo === 'producto') {
                productoId = item.id;
            } else {
                comboId = item.id;
            }
            candy.push({
                compra_id: compra.id,
                producto_id: productoId,
                combo_id: comboId,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
            });
        }

        if (candy.length > 0) {
            const { error: errorCandy } = await this.auth.client()
                .from('candy_vendido')
                .insert(candy);

            if (errorCandy) {
                console.error('Error creando el candy:', errorCandy);
                await this.cancelarCompra(compra.id);
                return null;
            }
        }

        return compra;
    }

    private async cancelarCompra(compraId: number) {
        await this.auth.client()
            .from('entradas')
            .update({ estado: 'cancelada' })
            .eq('compra_id', compraId);

        await this.auth.client()
            .from('compras')
            .update({ estado: 'cancelada' })
            .eq('id', compraId);
    }
}