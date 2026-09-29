import { Service, inject } from '@angular/core';
import { AltaFuncion, GetFuncion } from '../modelos/datos-funciones';
import { Auth } from './auth';

@Service()
export class Funciones {
    private auth = inject(Auth)

    async obtenerFunciones(): Promise<GetFuncion[]> {
        const { data, error } = await this.auth.client()
            .from('funciones')
            .select('*')
            .order('id');

        if (error) {
                console.error('Error trayendo las funciones:', error);
                return [];
            }

        return data ?? [];
    }

    async obtenerFuncionesPorPelicula(peliculaId: string): Promise<GetFuncion[]> {
        const { data, error } = await this.auth.client()
            .from('funciones')
            .select('*')
            .eq('pelicula_id', peliculaId)
            .eq('estado', true);

        if (error) {
            console.error('Error trayendo las funciones de la película:', error);
            return [];
        }
        return data ?? [];
    }
    

    async crearFuncion(datos: AltaFuncion) {
        const { error } = await this.auth.client()
        .from('funciones')
        .insert(datos);

    return { error };
    }

    async actualizarFuncion(id: number, cambios: { inicio: string, fin: string, fin_bloqueo: string, formato: string, idioma: string, estado: boolean }) {
        const { error } = await this.auth.client()
            .from('funciones')
            .update(cambios)
            .eq('id', id);
        return { error };
    }

    async cambiarEstadoFuncion(id: number, activo: boolean) {
        const { error } = await this.auth.client()
            .from('funciones')
            .update({ estado: activo })
            .eq('id', id);
        return { error };
    }

}
