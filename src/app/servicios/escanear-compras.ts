import { Service, inject } from '@angular/core';
import { Auth } from './auth';
import { CompraEscaneo } from '../modelos/datos-escaneo';

@Service()
export class EscanearCompras {
    private auth = inject(Auth)

    async obtenerCompraPorCodigo(codigo: string): Promise<CompraEscaneo | null> {
        const { data, error } = await this.auth.client()
            .from('compras')
            .select(`*,
                entradas(id, estado,
                    butacas(fila, columna, tipo),
                    funciones(inicio, fin, formato, idioma, salas(nombre), peliculas(nombre))),
                candy_vendido(id, cantidad, estado, productos_candy(nombre), combos(nombre))`)
            .eq('qr_code', codigo)
            .single();

        if (error) {
            console.error('Error buscando la compra:', error);
            return null;
        }
        return data;
    }

    async validarCompra(compraId: number) {
        const { error: errorEntradas } = await this.auth.client()
            .from('entradas')
            .update({ estado: 'escaneada' })
            .eq('compra_id', compraId)
            .eq('estado', 'vigente');

        if (errorEntradas) {
            return { error: errorEntradas };
        }

        const { error: errorCandy } = await this.auth.client()
            .from('candy_vendido')
            .update({ estado: 'retirado' })
            .eq('compra_id', compraId)
            .eq('estado', 'vigente');

        return { error: errorCandy };
    }
}