import { Routes } from '@angular/router';
import { roleCliente } from './guards/role-cliente-guard';
import { roleAdmin } from './guards/role-admin-guard';
import { roleEmpleado } from './guards/role-empleado-guard';

export const routes: Routes = [
    {   
      path: "", 
      redirectTo: "login", 
      pathMatch: "full" 
    },
    {
      path: 'registro',
      loadComponent: () => import('./componentes/publico/registro/registro').then(m => m.Registro),
    },
    {
      path: 'login',
      loadComponent: () => import('./componentes/publico/login/login').then(m => m.Login),
    },
    {
      path: 'home-admin',
      loadComponent: () => import('./componentes/admin/home-admin/home-admin').then(m => m.HomeAdmin),
      canMatch: [roleAdmin]
    },
    {
      path: 'home-cliente',
      loadComponent: () => import('./componentes/cliente/home-cliente/home-cliente').then(m => m.HomeCliente),
      canMatch: [roleCliente]
    },
    {
      path: 'home-empleado',
      loadComponent: () => import('./componentes/empleado/home-empleado/home-empleado').then(m => m.HomeEmpleado),
      canMatch: [roleEmpleado]
    },

    {
      path: '**',
      redirectTo: "login",
        
    }
];
