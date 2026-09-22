import { Service, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';
import { DatosRegistro } from '../modelos/datos-registro';
import { UsuarioActual } from '../modelos/usuario-actual';

@Service()
export class Auth {
    private supabase: SupabaseClient;
    usuarioLogueado = signal(false);
    usuarioActual = signal<UsuarioActual | null>(null);
    ingresoAnonimo = signal(false);
    datosAnonimo = signal<{ nombre: string; apellido: string } | null>(null);
    
    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
        this.actualizarUsuarioLogueado();
    }
    
    private async actualizarUsuarioLogueado() {
        const usuario = await this.getCurrentUser();
        this.usuarioLogueado.set(usuario !== null); // si usuario es cualquier cosa menos null: true
        this.usuarioActual.set(usuario);
        }
    
    marcarIngresoAnonimo(nombre: string, apellido: string) {
        this.ingresoAnonimo.set(true);
        this.datosAnonimo.set({ nombre, apellido });
        }

    async signIn(email: string, password: string) {
        const resultado = await this.supabase.auth.signInWithPassword({ email, password }); // si resultado ok, devuelve el objeto data con user dentro
        await this.actualizarUsuarioLogueado();
        return resultado;
        }

    async signUp(datos: DatosRegistro) {
        const { data, error } = await this.supabase.auth.signUp({
            email: datos.email,
            password: datos.password,
        });

        if (error || !data.user) {
            return { error };
        }

        const { error: errorPerfil } = await this.supabase
            .from('usuarios')
            .insert({
            id: data.user.id,
            mail: datos.email,
            nombre: datos.nombre,
            apellido: datos.apellido,
            fecha_nacimiento: datos.fechaNacimiento,
            tipo_sangre: datos.tipoSangre,
            color_ojos: datos.colorOjos,
            dias_vacaciones_anio: datos.diasVacacionesAnio,
            });

        await this.signOut();

        return { error: errorPerfil };
        }

    async signOut() {
        const resultado = await this.supabase.auth.signOut(); // salgo de la sesion
        await this.actualizarUsuarioLogueado(); // llamo a getCurrentUser, al ser null, corta el flujo y acualiza UsuarioLogueado a false y usuarioActual a null
        return resultado;
        }

    getUser() {
        return this.supabase.auth.getUser();
        }

    getUsers() {
        return this.supabase.from('usuarios').select('*');
        }

    async getCurrentUser(): Promise<UsuarioActual | null> {
        const { data: sesion } = await this.getUser();
        if (!sesion.user) {
            return null;
        }
        const { data: usuario, error: errorUsuario } = await this.supabase
            .from('usuarios')
            .select('id, mail, rol')
            .eq('id', sesion.user.id) // sesion.user.id viene de getUser que busca en la tabla una fila que matchee con este id actual, y devuelve la fila correspondiente: id, mail, rol
            .single();
        if (errorUsuario) {
            console.error('Error buscando el usuario:', errorUsuario);
            return null;
        }
        return usuario;
    }

    client() {
        return this.supabase;
    }
}