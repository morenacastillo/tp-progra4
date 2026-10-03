import { AbstractControl, ValidationErrors } from '@angular/forms';

export function FechaValidator(control: AbstractControl): ValidationErrors | null {
    const texto = control.value;
    if (!texto) {
        return null;
    }

    const partes = texto.split('/');
    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);

    const esperado = String(dia).padStart(2, '0') + '/' + String(mes).padStart(2, '0') + '/' + anio;
    if (texto !== esperado || texto.length !== 10) {
        return { fechaInvalida: true };
    }

    const fecha = new Date(anio, mes - 1, dia);
    if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1) {
        return { fechaInvalida: true };
    }
    return null;
}
