import { Service, inject } from '@angular/core';
import { Auth } from './auth';
import { GetActividad } from '../modelos/datos-actividad';

@Service()
export class Actividad {
    private auth = inject(Auth);

    async obtenerLogs(): Promise<GetActividad[]> {
        const { data, error } = await this.auth.client()
            .from('log_actividad')
            .select('*, usuarios(nombre, apellido)')
            .order('id', { ascending: false });

        if (error) {
            console.error('Error trayendo los logs de actividad:', error);
            return [];
        }

        return data ?? [];
    }

    async crearLog(accion: string, detalle: string) {
        const usuario = this.auth.usuarioActual();
        if (!usuario) {
            return;
        }

        const { error } = await this.auth.client()
            .from('log_actividad')
            .insert({ usuario_id: usuario.id, accion: accion, detalle: detalle });

        if (error) {
            console.error('Error guardando el log de actividad:', error);
        }
    }

}
