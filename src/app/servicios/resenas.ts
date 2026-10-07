import { Service, inject } from '@angular/core';
import { AltaResena, GetResena } from '../modelos/datos-resenas';
import { Auth } from './auth';

@Service()
export class Resenas {
    private auth = inject(Auth)

    async obtenerResenaPorPelicula(peliculaId: string): Promise<GetResena[]> {
        const { data, error } = await this.auth.client()
            .from('resenas')
            .select('*, usuarios(nombre, apellido), peliculas(nombre)')
            .eq('pelicula_id', peliculaId)
            .order('fecha', {ascending: false});

        if (error) {
            console.error('Error trayendo los datos:', error);
            return [];
        }
        return data ?? [];
    }

    async obtenerResenaPorUsuario(usuarioId: string): Promise<GetResena[]> {
        const { data, error } = await this.auth.client()
            .from('resenas')
            .select('*, usuarios(nombre, apellido), peliculas(nombre)')
            .eq('usuario_id', usuarioId)
            .order('fecha', {ascending: false});
        if (error) {
            console.error('Error trayendo los datos:', error);
            return [];
        }
        return data ?? [];
    }
    
    
    async crearResena(datos: AltaResena) {
        const { error } = await this.auth.client()
            .from('resenas')
            .insert(datos);
        return { error };
    }
    

}
