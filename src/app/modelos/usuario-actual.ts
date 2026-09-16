export interface UsuarioActual {
    id: string;
    mail: string;
    rol: 'cliente' | 'empleado' | 'admin';
}
