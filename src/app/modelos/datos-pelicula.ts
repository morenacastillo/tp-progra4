export interface DatosPelicula {
    nombre: string;
    sinopsis: string;
    imagen_url: string;
    duracion_minutos: number;
    restriccion_edad: number;
    fecha_estreno: string;
    precio_base: number;
    precio_vip: number;
    precio_preventa: number | null;
    dias_preventa: number | null;
}
