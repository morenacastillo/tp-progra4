export interface AltaFuncion {
    pelicula_id: number;
    sala_id: number;
    inicio: string;
    fin: string;
    fin_bloqueo: string;
    formato: string;
    idioma: string;
    subtitulado: boolean;
}

export interface GetFuncion {
    id: number;
    pelicula_id: number;
    sala_id: number;
    inicio: string;
    fin: string;
    fin_bloqueo: string;
    formato: string;
    idioma: string;
    subtitulado: boolean;
    creado_en: string;
}