export interface GetActividad {
    id: number;
    usuario_id: string;
    usuarios: { nombre: string; apellido: string };
    accion: string;
    detalle: string;
    fecha: string
}