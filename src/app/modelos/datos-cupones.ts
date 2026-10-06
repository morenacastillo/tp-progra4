export interface GetCupon {
    id: number;
    codigo: string;
    descripcion: string;
    porcentaje_descuento: number;
    solo_primera_compra: boolean;
    edad_minima: number;
    activo: boolean;
    valido_desde: string;
    valido_hasta: string | null;
}

export interface AltaCupon {
    codigo: string;
    descripcion: string;
    porcentaje_descuento: number;
    solo_primera_compra: boolean;
    edad_minima: number;
    valido_desde: string;
    valido_hasta: string | null;
}
