import { Service, inject } from '@angular/core';
import { DatosFunciones } from '../modelos/datos-funciones';
import { Auth } from './auth';

@Service()
export class Funciones {
    private auth = inject(Auth)


    async obtenerFunciones() {
        const { data, error } = await this.auth.client()
            .from('funciones')
            .select('*');

        if (error) {
                console.error('Error trayendo las funciones:', error);
                return [];
            }

        return data ?? [];
    }

    async crearFuncion(datos: DatosFunciones) {
        const { error } = await this.auth.client()
        .from('funciones')
        .insert(datos);

        return { error };
    }
}

