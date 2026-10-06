import { Service } from '@angular/core';

@Service()
export class Fechas {

    aFechaBase(fecha: string) {
        const partes = fecha.split('/');
        return partes[2] + '-' + partes[1] + '-' + partes[0];
    }

    aFechaTexto(fecha: string) {
        const partes = fecha.slice(0, 10).split('-');
        return partes[2] + '/' + partes[1] + '/' + partes[0];
    }

}
