import { Service, inject, signal } from '@angular/core';
import { Supabase } from './supabase';
import { DatosRegistro } from '../modelos/datos-registro';
import { DatosLogin } from '../modelos/datos-login';
import { UsuarioActual } from '../modelos/usuario-actual';

@Service()
export class Auth {
    private supabaseService = inject(Supabase);

    usuarioLogueado = signal(false);
    usuarioActual = signal<UsuarioActual | null>(null);
    
    ingresoAnonimo = signal(false);
    datosAnonimo = signal<{ nombre: string; apellido: string } | null>(null);

    constructor() {
    this.actualizarUsuarioLogueado()
    }

    private async actualizarUsuarioLogueado() {
        const usuario = await this.getCurrentUser();
        this.usuarioLogueado.set(usuario !== null);
        this.usuarioActual.set(usuario);
    }

      marcarIngresoAnonimo(nombre: string, apellido: string) {
        this.ingresoAnonimo.set(true);
        this.datosAnonimo.set({ nombre, apellido });
    }

    async signIn(email: string, password: string) {
        const resultado = await this.supabaseService.supabase.auth.signInWithPassword({ email, password });
        await this.actualizarUsuarioLogueado();
        return resultado;
    }

    async signUp(email: string, password: string) {
        const resultado = await this.supabaseService.supabase.auth.signUp({ email, password });
        await this.actualizarUsuarioLogueado();
        return resultado;
    }

    async signOut() {
        const resultado = await this.supabaseService.supabase.auth.signOut();
        await this.actualizarUsuarioLogueado();
        return resultado;
    }

    getUser() {
        return this.supabaseService.supabase.auth.getUser();
    }

    getUsers() {
        return this.supabaseService.supabase.from('usuarios').select('*');
    }

    async getCurrentUser(): Promise<UsuarioActual | null> {
        const { data: sesion } = await this.getUser();

        if (!sesion.user) {
            return null;
        }

        const { data: usuario } = await this.supabaseService.supabase
            .from('usuarios')
            .select('id, mail, rol')
            .eq('id', sesion.user.id)
            .single();

        return usuario;
    }

    obtenerRutaHomePorRol(rol: string | undefined): string {
        switch (rol) {
            case 'admin': 
                return '/home-admin';
            case 'empleado':
                return '/home-empleado';
            case 'cliente':
                return '/home-cliente';
            default:
                return '/login';
        }
    }

    async registrarUsuario(datos: DatosRegistro) {
        const { data, error } = await this.signUp(datos.email, datos.password);

        if (error || !data.user) {
            return { error };
        }

    
        const { error: errorPerfil } = await this.supabaseService.supabase
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

            return { error: errorPerfil };
        }




}
