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
    let filtradas: GetPelicula[] = [];
    for (let pelicula of peliculas) {
      if (pelicula.generos.includes(genero)) {
        filtradas.push(pelicula);
      }
    }
    return filtradas;
  }
}
