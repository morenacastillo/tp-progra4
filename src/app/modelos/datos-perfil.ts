export interface DatosUsuario {
    id: string;
    mail: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    tipo_sangre: string;
    color_ojos: string;
    dias_vacaciones_anio: number;
}

export interface CompraPerfil {
    id: number;
    fecha: string;
    subtotal: number;
    total: number;
    metodo_pago: string;
    qr_code: string;
    entradas: {
        precio: number;
        combo_id: number | null;
        butacas: { fila: string; columna: number; tipo: string };
        funciones: {
            inicio: string;
            fin: string;
            formato: string;
            idioma: string;
            salas: { nombre: string };
            peliculas: { id: number; nombre: string; imagen_url: string };
        };
    }[];
    candy_vendido: {
        cantidad: number;
        precio_unitario: number;
        productos_candy: { nombre: string } | null;
        combos: { nombre: string } | null;
    }[];
}