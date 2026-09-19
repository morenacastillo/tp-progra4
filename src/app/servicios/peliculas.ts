import { Service, inject } from '@angular/core';
import { Supabase } from './supabase';

@Service()
export class Peliculas {
    private supabaseService = inject(Supabase);

    async obtenerPeliculas() {
        const { data, error } = await this.supabaseService.supabase
        .from('peliculas')
        .select('*');

        return data ?? [];
    }

    async obtenerPeliculaPorId(id: string) {
        const { data, error } = await this.supabaseService.supabase
            .from('peliculas')
            .select('*')
            .eq('id', id)
            .single();

        return data;
    }

    async crearPelicula(datos: {
        nombre: string;
        sinopsis: string;
        imagen_url: string;
        duracion_minutos: number;
        restriccion_edad: number;
        fecha_estreno: string;
        precio_base: number;
        precio_vip: number;
        precio_preventa: number | null;
        dias_preventa: number | null;
        }) {
        const { error } = await this.supabaseService.supabase
            .from('peliculas')
            .insert(datos);

        return { error };
    }
}
