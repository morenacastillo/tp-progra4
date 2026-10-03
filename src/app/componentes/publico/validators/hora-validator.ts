import { AbstractControl, ValidationErrors } from '@angular/forms';

export function HoraValidator(control: AbstractControl): ValidationErrors | null {
    const texto = control.value;
    if (!texto) {
        return null;
    }

    const partes = texto.split(':');
    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    const esperado = String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0');
    if (texto !== esperado) {
        return { horaInvalida: true };
    }

    if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        return { horaInvalida: true };
    }
    return null;
}
