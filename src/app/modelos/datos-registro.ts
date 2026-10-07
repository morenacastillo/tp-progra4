export interface DatosRegistro {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    tipoSangre: string;
    colorOjos: string;
    diasVacacionesAnio: number;
}

export interface GetUsuarios {
    id: string;
    mail: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    tipo_sangre: string;
    color_ojos: string;
    dias_vacaciones_anio: number;
    rol: string;
}