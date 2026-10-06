import { Pipe, PipeTransform } from '@angular/core';
import { GetPelicula } from '../../../modelos/datos-pelicula';

@Pipe({
  name: 'genero',
})
export class GeneroPipe implements PipeTransform {
  transform(peliculas: GetPelicula[], genero: string): GetPelicula[] {
    if (!genero) {
      return peliculas
    }
    return peliculas.filter(pelicula => pelicula.generos.includes(genero)
    );
  }
}
