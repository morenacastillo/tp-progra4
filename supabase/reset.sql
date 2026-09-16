-- Solo para desarrollo: borra todo lo que haya quedado de una corrida
-- anterior de schema.sql, para poder volver a correrlo limpio.
-- NO usar esto una vez que haya datos reales cargados.

drop table if exists public.logs_actividad cascade;
drop table if exists public.alertas_estreno cascade;
drop table if exists public.resenas cascade;
drop table if exists public.movimientos_credito cascade;
drop table if exists public.canjes cascade;
drop table if exists public.recompensas cascade;
drop table if exists public.movimientos_puntos cascade;
drop table if exists public.reservas_temporales cascade;
drop table if exists public.candy_vendido cascade;
drop table if exists public.entradas cascade;
drop table if exists public.compras cascade;
drop table if exists public.cupones cascade;
drop table if exists public.combo_productos cascade;
drop table if exists public.combos cascade;
drop table if exists public.productos_candy cascade;
drop table if exists public.categorias_candy cascade;
drop table if exists public.funciones cascade;
drop table if exists public.butacas cascade;
drop table if exists public.salas cascade;
drop table if exists public.pelicula_generos cascade;
drop table if exists public.peliculas cascade;
drop table if exists public.generos cascade;
drop table if exists public.usuarios cascade;

drop function if exists public.rol_actual() cascade;
drop function if exists public.proteger_rol_usuario() cascade;
drop function if exists public.otorgar_puntos_por_compra() cascade;
drop function if exists public.otorgar_credito_por_cancelacion() cascade;
drop function if exists public.procesar_canje() cascade;
