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

    hoyTexto() {
        const hoy = new Date();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0'); //mes actual +1
        const dia = String(hoy.getDate()).padStart(2, '0'); // dia actual
        return hoy.getFullYear() + '-' + mes + '-' + dia;
    }

    edad(fechaNacimiento: string) {
        const hoy = this.hoyTexto();
        let edad = Number(hoy.slice(0, 4)) - Number(fechaNacimiento.slice(0, 4));

        if (hoy.slice(5) < fechaNacimiento.slice(5)) {
            edad = edad - 1;
        }
        return edad;
    }


}
