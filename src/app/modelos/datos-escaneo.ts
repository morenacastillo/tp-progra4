export interface CompraEscaneo {
    id: number;
    fecha: string;
    estado: string;
    total: number;
    qr_code: string;
    entradas: {
        id: number;
        estado: string;
        butacas: { fila: string; columna: number; tipo: string };
        funciones: {
            inicio: string;
            fin: string;
            formato: string;
            idioma: string;
            salas: { nombre: string };
            peliculas: { nombre: string };
        };
    }[];
    candy_vendido: {
        id: number;
        cantidad: number;
        estado: string;
        productos_candy: { nombre: string } | null;
        combos: { nombre: string } | null;
    }[];
}