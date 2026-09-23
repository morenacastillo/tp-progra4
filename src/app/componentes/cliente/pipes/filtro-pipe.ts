import { Pipe, PipeTransform } from '@angular/core';
import { GetPelicula } from '../../../modelos/datos-pelicula';

@Pipe({
  name: 'filtro',
})
export class FiltroPipe implements PipeTransform {
  transform(peliculas: GetPelicula[], busqueda: string): GetPelicula[] {
    if (!busqueda) {
      return peliculas
    }
    return peliculas.filter(pelicula => pelicula.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
}
