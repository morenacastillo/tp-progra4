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

    async actualizarPelicula(id: number, cambios: { nombre: string, duracion: number, restriccion_edad: number, fecha_estreno: string, precio_base: number,
    precio_vip: number, precio_preventa: number | null, estado: boolean, etapa: string,}) {
        const { error } = await this.auth.client()
            .from('peliculas')
            .update(cambios)
            .eq('id', id); 
        return { error };
    }

    async cambiarEstadoPelicula(id: number, activo: boolean) {
        const { error } = await this.auth.client()
            .from('peliculas')
            .update({ estado: activo })
            .eq('id', id);
        return { error };
    }

    async obtenerTop3() {
        const { data, error } = await this.auth.client()
            .from('peliculas')
            .select('*, funciones(entradas(estado))')
            .eq('estado', true);

        if (error) {
            console.error('Error trayendo las más vendidas:', error);
            return [];
        }

        for (let pelicula of data) {
            pelicula.cantidadVendida = this.contarEntradasVendidas(pelicula);
        }

        data.sort((a, b) => b.cantidadVendida - a.cantidadVendida);

        return data.slice(0, 3);
    }

    private contarEntradasVendidas(pelicula: any) {
        let contador = 0;

        for (let funcion of pelicula.funciones) {
            for (let entrada of funcion.entradas) {
                if (entrada.estado !== 'cancelada') {
                    contador = contador + 1;
                }
            }
        }
        return contador;
    }

    async obtenerProximosEstrenos() {
        const { data, error } = await this.auth.client()
            .from('peliculas')
                .select('*')
                .eq('etapa', 'Proximamente')
                .eq('estado', true);

        if (error) {
            console.error('Error trayendo los proximos estrenos:', error);
            return [];
        }
        return data ?? []
        }
}
