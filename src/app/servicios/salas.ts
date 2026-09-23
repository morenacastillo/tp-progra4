import { inject, Service } from '@angular/core';
import { Auth } from './auth';
import { DatosSalas } from '../modelos/datos-salas';

@Service()
export class Salas {
    private auth = inject(Auth)

    async obtenerSalas() {
        const { data, error } = await this.auth.client()
            .from('salas')
            .select('*');

        if (error) {
            console.error('Error trayendo las salas:', error);
            return [];
        }

        return data ?? [];
        }

    async obtenerButacas(salaId: number) {
        const { data, error } = await this.auth.client()
            .from('butacas')
            .select('*')
            .eq('sala_id', salaId)
            .order('fila')
            .order('columna');

        if (error) {
            console.error('Error trayendo las butacas:', error);
            return [];
        }

        return data ?? [];
        }

}
