import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtro',
})
export class FiltroPipe implements PipeTransform {
  transform(peliculas: any[], busqueda: string): any[] {
    if (!busqueda) {
      return peliculas
    }
    return peliculas.filter(pelicula => pelicula.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
}
