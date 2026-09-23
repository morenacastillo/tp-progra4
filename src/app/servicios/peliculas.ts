import { Service, inject } from '@angular/core';
import { Auth } from './auth';
import { AltaPelicula, GetPelicula } from '../modelos/datos-pelicula';

@Service()
export class Peliculas {
    private auth = inject(Auth);

    async obtenerPeliculas(): Promise<GetPelicula[]> {
        const { data, error } = await this.auth.client()
            .from('peliculas')
            .select('*')
            .order('id');

        if (error) {
            console.error('Error trayendo las películas:', error);
            return [];
        }

        return data ?? [];
        }

    async obtenerPeliculaPorId(id: string): Promise<GetPelicula | null> {
        const { data, error } = await this.auth.client()
            .from('peliculas')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error trayendo la película:', error);
            return null;
        }

        return data;
        }

    async crearPelicula(datos: AltaPelicula) {
        const { error } = await this.auth.client()
            .from('peliculas')
            .insert(datos);

        return { error }; // si la insercion fue exitosa -> error: null
    }
}
