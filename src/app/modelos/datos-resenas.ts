export interface AltaResena {
    usuario_id: string;
    pelicula_id: number;
    estrellas: number;
    comentario: string;
}

export interface GetResena {
    id: number;
    usuario_id: string;
    pelicula_id: number;
    estrellas: number;
    comentario: string;
    fecha: string;
    usuarios: {nombre: string, apellido: string};
    peliculas: {nombre: string}
}