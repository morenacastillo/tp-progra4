export interface AltaButacas {
    sala_id: number;
    fila: string;
    columna: number;
    tipo: string;
    activa: boolean;
}

export interface GetButacas {
    id: number;
    sala_id: number;
    fila: string;
    columna: number;
    tipo: string;
    activa: boolean;
}