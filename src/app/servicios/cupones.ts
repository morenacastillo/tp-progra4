import { inject, Service } from '@angular/core';
import { Auth } from './auth';
import { GetCupon, AltaCupon } from '../modelos/datos-cupones';

@Service()
export class Cupones {
    private auth = inject(Auth)

    async obtenerCupones(): Promise<GetCupon[]> {
        const { data, error } = await this.auth.client()
            .from('cupones')
            .select('*')
            .order('id');
        if (error) {
            console.error('Error trayendo los cupones:', error);
            return [];
        }
        return data ?? [];
    }

    async obtenerCuponPorCodigo(codigo: string): Promise<GetCupon | null> {
        const { data, error } = await this.auth.client()
            .from('cupones')
            .select('*')
            .eq('codigo', codigo)
            .single();

        if (error) {
            console.error('Error trayendo el cupon:', error);
            return null;
        }
        return data;
    }


    async crearCupon(datos: AltaCupon) {
        const { data, error } = await this.auth.client()
            .from('cupones')
            .insert(datos)
            .select()
            .single();
        return { data, error };
    }

    async actualizarCupon(id: number, cambios: { codigo: string; descripcion: string; porcentaje_descuento: number; solo_primera_compra: boolean; edad_minima: number; activo: boolean; valido_desde: string; valido_hasta: string;}) {
        const { error } = await this.auth.client()
            .from('cupones')
            .update(cambios)
            .eq('id', id);
        return { error };
    }

    async cambiarEstadoCupon(id: number, activo: boolean) {
        const { error } = await this.auth.client()
            .from('cupones')
            .update({ activo: activo })
            .eq('id', id);
        return { error };
    }

}
