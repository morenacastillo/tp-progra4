import { Service, inject } from '@angular/core';
import { Auth } from './auth';
import { GetCategoria, AltaProducto, GetProducto} from '../modelos/datos-candy';

@Service()
export class Candy {
    private auth = inject(Auth)

    async obtenerCategorias(): Promise<GetCategoria[]> {
        const { data, error } = await this.auth.client()
            .from('categorias_candy')
            .select('*')
            .order('id');
        if (error) {
            console.error('Error trayendo las categorias del candy:', error);
            return [];
        }
        return data ?? [];
    }

    async obtenerProductos(): Promise<GetProducto[]> {
        const { data, error } = await this.auth.client()
            .from('productos_candy')
            .select('*')
            .order('id');
        if (error) {
            console.error('Error trayendo los productos del candy:', error);
            return [];
        }
        return data ?? [];
    }

    async crearProducto(datos: AltaProducto) {
        const { error } = await this.auth.client()
        .from('productos_candy')
            .insert(datos);
        return { error };
    }

    async actualizarProducto(id: number, cambios: { categoria_id: number; nombre: string; descripcion: string; precio: number; imagen_url: string | null; estado: boolean }) {
        const { error } = await this.auth.client()
            .from('productos_candy')
            .update(cambios)
            .eq('id', id);
        return { error };
    }

    async cambiarEstadoProducto(id: number, estado: boolean) {
        const { error } = await this.auth.client()
            .from('productos_candy')
            .update({ estado })
            .eq('id', id);
        return { error };
    }
    
}




