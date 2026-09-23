export interface AltaPelicula {
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
    imagen_horizontal_url: string;
}

export interface GetPelicula {
    id: number;
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
    imagen_horizontal_url: string;
    estado: boolean;
    creado_en: string;
    etapa: 'Cartelera' | 'Proximamente';
}