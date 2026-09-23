import { inject, Service } from '@angular/core';
import { Auth } from './auth';
import { DatosSalas } from '../modelos/datos-salas';

@Service()
export class Salas {
    private auth = inject(Auth)

    async obtenerSalas() {
        const { data, error } = await this.auth.client()
            .from('salas')
            .select('*')
            .order('id');
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

    async crearSala(nombre: string, formato: string) {

        const { data, error } = await this.auth.client()
            .from('salas')
            .insert({ nombre, formato })
            .select()
            .single();

        if (error) {
            return error;
        }

        const butacas = this.generarButacas(data.id);

        const { error: errorButacas } = await this.auth.client()
            .from('butacas')
            .insert(butacas);
        return errorButacas; 
    }

    async actualizarSala(id: number, cambios: { nombre: string; formato: string; habilitada: boolean }) {
        const { error } = await this.auth.client()
            .from('salas')
            .update(cambios)
            .eq('id', id); 
        return error;
    }

    private generarButacas(salaId: number) {
        const filas = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
        const columnas = [1,2,3,4,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,27,28,29,30];
        const columnasAccesibles = [2,3, 11,12,13,14,15,16,17,18,19,20, 28,29]; 
        const butacas = [];

        for (const fila of filas) {
            for (const columna of columnas) {
                let tipo = 'normal';
                let activa = true;

                if (fila === 'R' || fila === 'S' || fila === 'T') {
                    tipo = 'vip';
                }

                if (fila === 'K') { 
                    activa = false;
                }

                if (fila === 'J') {
                    if (columnasAccesibles.includes(columna)) {
                        tipo = 'accesible';
                    } else {
                        activa = false;
                    }
                }
                butacas.push({ sala_id: salaId, fila, columna, tipo, activa });
            }
        }

        return butacas;
    }
}
