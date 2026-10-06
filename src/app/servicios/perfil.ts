import { inject, Service } from '@angular/core';
import { CompraPerfil, DatosUsuario } from '../modelos/datos-perfil';
import { Auth } from './auth';

@Service()
export class Perfil {
    private auth = inject(Auth)

    async obtenerDatos(): Promise<DatosUsuario | null> {
        const usuario = await this.auth.getCurrentUser()
        if (!usuario) {
            return null;
        }
        const { data, error } = await this.auth.client()
            .from('usuarios')
            .select('*')
            .eq('id', usuario.id)
            .single();
        if (error) {
            console.error('Error trayendo los datos:', error);
            return null;
        }
        return data;
        }


    async obtenerCompras(): Promise<CompraPerfil[]> {
        const usuario = await this.auth.getCurrentUser()
        if (!usuario) {
            return [];
        }
        const { data, error } = await this.auth.client()
            .from('compras')
            .select(`*,
                entradas(precio, combo_id,
                    butacas(fila, columna, tipo),
                    funciones(inicio, formato, idioma, salas(nombre), peliculas(nombre, imagen_url))),
                    candy_vendido(cantidad, precio_unitario, productos_candy(nombre), combos(nombre))`)
            .eq('usuario_id', usuario.id)
            .eq('estado', 'confirmada')
            .order('fecha', { ascending: false });
        if (error) {
            console.error('Error trayendo las compras:', error);
            return [];
        }
        return data ?? [];
    }



}
