import { inject, Service } from '@angular/core';
import { AltaCombo, GetCombo, ComboProducto } from '../modelos/datos-combos';
import { Auth } from './auth';

@Service()
export class Combos {
    private auth = inject(Auth)
    
    async obtenerCombos(): Promise<GetCombo[]> {
        const { data, error } = await this.auth.client()
            .from('combos')
            .select('*')
            .order('id');
        if (error) {
            console.error('Error trayendo los combos:', error);
            return [];
        }
        return data ?? [];
    }

    async obtenerProductosDeCombo(comboId: number): Promise<ComboProducto[]> {
        const { data, error } = await this.auth.client()
            .from('combo_productos')
            .select('*')
            .eq('combo_id', comboId);

        if (error) {
            console.error('Error trayendo los productos del combo:', error);
            return [];
        }
        return data ?? [];
    }

    async crearCombo(datos: AltaCombo) {
        const { data, error } = await this.auth.client()
            .from('combos')
            .insert(datos)
            .select()
            .single();
        return { data, error };
    }

    async agregarProductoACombo(item: ComboProducto) {
        const { error } = await this.auth.client()
            .from('combo_productos')
            .insert(item);
        return { error };
    }

    async actualizarCombo(id: number, cambios: { nombre: string; descripcion: string; precio: number; imagen_url: string | null; estado: boolean }) {
        const { error } = await this.auth.client()
            .from('combos')
            .update(cambios)
            .eq('id', id);
        return { error };
    }

    async cambiarEstadoCombo(id: number, estado: boolean) {
        const { error } = await this.auth.client()
            .from('combos')
            .update({ estado })
            .eq('id', id);
        return { error };
    }
}
