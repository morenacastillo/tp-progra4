import { Service, inject } from '@angular/core';
import { Supabase } from './supabase';
import { DatosRegistro } from '../modelos/datos-registro';
import { DatosLogin } from '../modelos/datos-login';
import { UsuarioActual } from '../modelos/usuario-actual';

@Service()
export class Auth {
  private supabaseService = inject(Supabase);

  signIn(email: string, password: string) {
    return this.supabaseService.supabase.auth.signInWithPassword({ email, password });
  }

    signUp(email: string, password: string) {
        return this.supabaseService.supabase.auth.signUp({email, password});
    }

    signOut() {
        return this.supabaseService.supabase.auth.signOut();
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
