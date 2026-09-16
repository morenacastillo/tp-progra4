-- ============================================================================
-- TP1 Programación IV — Sistema de cine
-- Row Level Security (RLS): quién puede leer/escribir cada tabla
-- ============================================================================
-- Correr DESPUÉS de schema.sql, entero, de una sola vez.
-- ============================================================================


-- ============================================================================
-- 0) FUNCIÓN AUXILIAR: rol del usuario logueado
-- ============================================================================
-- security definer = esta función corre "como dueña de la tabla", no como
-- el usuario que la llama. Es necesario: si no fuera así, para saber el rol
-- habría que hacer un SELECT sobre "usuarios", que a su vez tiene RLS, que
-- a su vez llamaría a esta función... un loop infinito. Con security
-- definer, esta consulta puntual se salta el RLS (solo esta, no las del
-- resto de la app) y devuelve el rol sin drama.
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.usuarios where id = auth.uid()
$$;


-- ============================================================================
-- 1) ACTIVAR RLS EN TODAS LAS TABLAS
-- ============================================================================

alter table public.usuarios            enable row level security;
alter table public.generos             enable row level security;
alter table public.peliculas           enable row level security;
alter table public.pelicula_generos    enable row level security;
alter table public.salas               enable row level security;
alter table public.butacas             enable row level security;
alter table public.funciones           enable row level security;
alter table public.categorias_candy    enable row level security;
alter table public.productos_candy     enable row level security;
alter table public.combos              enable row level security;
alter table public.combo_productos     enable row level security;
alter table public.cupones             enable row level security;
alter table public.compras             enable row level security;
alter table public.entradas            enable row level security;
alter table public.candy_vendido       enable row level security;
alter table public.reservas_temporales enable row level security;
alter table public.movimientos_puntos  enable row level security;
alter table public.recompensas         enable row level security;
alter table public.canjes              enable row level security;
alter table public.movimientos_credito enable row level security;
alter table public.resenas             enable row level security;
alter table public.alertas_estreno     enable row level security;
alter table public.logs_actividad      enable row level security;


-- ============================================================================
-- 2) USUARIOS
-- ============================================================================

-- Ver: cada uno se ve a sí mismo. Admin ve a todos (backoffice).
create policy usuarios_select on public.usuarios
  for select to authenticated
  using (id = auth.uid() or rol_actual() = 'admin');

-- Crear: solo al registrarse, y SOLO como 'cliente'. Esto es lo que evita
-- que alguien se auto-registre como admin editando el request desde la
-- consola del navegador — el rol siempre entra como 'cliente' acá.
create policy usuarios_insert_propio on public.usuarios
  for insert to authenticated
  with check (id = auth.uid() and rol = 'cliente');

-- Editar: cada uno edita sus propios datos. Admin puede editar cualquiera
-- (para ascender a alguien a empleado/admin, por ejemplo).
create policy usuarios_update on public.usuarios
  for update to authenticated
  using (id = auth.uid() or rol_actual() = 'admin');

-- Nadie puede subir su propio "rol" por su cuenta, ni siquiera editando su
-- propia fila: solo un admin puede cambiar el rol de alguien.
create or replace function public.proteger_rol_usuario()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rol <> old.rol and rol_actual() <> 'admin' then
    new.rol := old.rol;
  end if;
  return new;
end;
$$;

create trigger usuarios_proteger_rol
  before update on public.usuarios
  for each row
  execute function public.proteger_rol_usuario();


-- ============================================================================
-- 3) CATÁLOGO: generos, peliculas, pelicula_generos
-- ============================================================================
-- Lectura pública (hay que poder ver la cartelera sin estar logueado).
-- Escritura solo admin.

create policy generos_select on public.generos
  for select to anon, authenticated using (true);
create policy generos_admin on public.generos
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy peliculas_select on public.peliculas
  for select to anon, authenticated using (true);
create policy peliculas_admin on public.peliculas
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy pelicula_generos_select on public.pelicula_generos
  for select to anon, authenticated using (true);
create policy pelicula_generos_admin on public.pelicula_generos
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');


-- ============================================================================
-- 4) SALAS, BUTACAS, FUNCIONES
-- ============================================================================
-- Mismo criterio: lectura pública (hace falta ver horarios y el mapa de
-- butacas antes de loguearse), escritura solo admin.

create policy salas_select on public.salas
  for select to anon, authenticated using (true);
create policy salas_admin on public.salas
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy butacas_select on public.butacas
  for select to anon, authenticated using (true);
create policy butacas_admin on public.butacas
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy funciones_select on public.funciones
  for select to anon, authenticated using (true);
create policy funciones_admin on public.funciones
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');


-- ============================================================================
-- 5) CANDY BAR Y COMBOS
-- ============================================================================

create policy categorias_candy_select on public.categorias_candy
  for select to anon, authenticated using (true);
create policy categorias_candy_admin on public.categorias_candy
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy productos_candy_select on public.productos_candy
  for select to anon, authenticated using (true);
create policy productos_candy_admin on public.productos_candy
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy combos_select on public.combos
  for select to anon, authenticated using (true);
create policy combos_admin on public.combos
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

create policy combo_productos_select on public.combo_productos
  for select to anon, authenticated using (true);
create policy combo_productos_admin on public.combo_productos
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');


-- ============================================================================
-- 6) CUPONES
-- ============================================================================
-- El beneficio de "primera compra" es solo para registrados, así que la
-- lectura de cupones pide estar logueado (no público). Escritura: admin.

create policy cupones_select on public.cupones
  for select to authenticated
  using (activo = true or rol_actual() = 'admin');
create policy cupones_admin on public.cupones
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');


-- ============================================================================
-- 7) COMPRAS, ENTRADAS, CANDY VENDIDO
-- ============================================================================

-- Ver: el dueño ve las suyas. Admin y empleado ven todas (reportes, y el
-- empleado necesita levantar la compra completa al escanear el QR).
create policy compras_select on public.compras
  for select to authenticated
  using (usuario_id = auth.uid() or rol_actual() in ('admin', 'empleado'));

-- Crear: un usuario logueado solo puede crear compras a su propio nombre
-- (no puede "comprar como" otro usuario). Las anónimas se manejan aparte.
create policy compras_insert_propia on public.compras
  for insert to authenticated
  with check (usuario_id = auth.uid());

create policy compras_insert_anonima on public.compras
  for insert to anon
  with check (usuario_id is null);

-- Actualizar (ej: cancelar): el dueño sobre lo suyo, admin/empleado sobre
-- cualquiera.
create policy compras_update on public.compras
  for update to authenticated
  using (usuario_id = auth.uid() or rol_actual() in ('admin', 'empleado'));

-- entradas y candy_vendido no tienen usuario_id propio: se llega a través
-- de la compra a la que pertenecen.
create policy entradas_select on public.entradas
  for select to authenticated
  using (
    rol_actual() in ('admin', 'empleado')
    or compra_id in (select id from public.compras where usuario_id = auth.uid())
  );

create policy entradas_insert on public.entradas
  for insert to anon, authenticated
  with check (
    compra_id in (
      select id from public.compras
      where estado = 'confirmada'
        and (usuario_id = auth.uid() or usuario_id is null)
    )
  );

-- El cliente puede tocar sus propias entradas (para cancelarlas junto con
-- la compra). Escanear (poner 'escaneada') es cosa de empleado/admin.
create policy entradas_update on public.entradas
  for update to authenticated
  using (
    rol_actual() in ('admin', 'empleado')
    or compra_id in (select id from public.compras where usuario_id = auth.uid())
  );

create policy candy_vendido_select on public.candy_vendido
  for select to authenticated
  using (
    rol_actual() in ('admin', 'empleado')
    or compra_id in (select id from public.compras where usuario_id = auth.uid())
  );

create policy candy_vendido_insert on public.candy_vendido
  for insert to anon, authenticated
  with check (
    compra_id in (
      select id from public.compras
      where estado = 'confirmada'
        and (usuario_id = auth.uid() or usuario_id is null)
    )
  );

create policy candy_vendido_update on public.candy_vendido
  for update to authenticated
  using (
    rol_actual() in ('admin', 'empleado')
    or compra_id in (select id from public.compras where usuario_id = auth.uid())
  );


-- ============================================================================
-- 8) RESERVAS TEMPORALES (butaca en el carrito de otro, en tiempo real)
-- ============================================================================
-- Necesitan ser visibles para todos (para pintar el mapa de butacas ocupado
-- en el momento), y cualquiera puede crear/borrar la suya.

create policy reservas_temporales_select on public.reservas_temporales
  for select to anon, authenticated using (true);

create policy reservas_temporales_insert on public.reservas_temporales
  for insert to anon, authenticated
  with check (usuario_id = auth.uid() or usuario_id is null);

create policy reservas_temporales_delete on public.reservas_temporales
  for delete to anon, authenticated
  using (usuario_id = auth.uid() or usuario_id is null);


-- ============================================================================
-- 9) FIDELIZACIÓN: puntos, recompensas y canjes
-- ============================================================================
-- OJO ACÁ: no hay política de INSERT para movimientos_puntos para clientes
-- comunes. A propósito. Si un cliente pudiera insertar sus propios
-- movimientos "ganados", podría regalarse puntos infinitos escribiendo
-- directo contra la API. En cambio, los puntos los otorga un TRIGGER (ver
-- sección 11), que corre con privilegios propios y no necesita política.

create policy movimientos_puntos_select on public.movimientos_puntos
  for select to authenticated
  using (usuario_id = auth.uid() or rol_actual() = 'admin');

create policy recompensas_select on public.recompensas
  for select to anon, authenticated using (true);
create policy recompensas_admin on public.recompensas
  for all to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');

-- Canjear sí lo puede iniciar el cliente (elige qué canjear), pero el
-- trigger de la sección 11 valida que tenga puntos suficientes y es quien
-- descuenta el saldo — el cliente no puede mentir sobre cuántos puntos usa.
create policy canjes_select on public.canjes
  for select to authenticated
  using (usuario_id = auth.uid() or rol_actual() = 'admin');

create policy canjes_insert on public.canjes
  for insert to authenticated
  with check (usuario_id = auth.uid());


-- ============================================================================
-- 10) CRÉDITOS
-- ============================================================================
-- Mismo criterio que los puntos: nadie inserta esto a mano, lo genera el
-- trigger de cancelación (sección 11).

create policy movimientos_credito_select on public.movimientos_credito
  for select to authenticated
  using (usuario_id = auth.uid() or rol_actual() = 'admin');


-- ============================================================================
-- 11) TRIGGERS: puntos y créditos los calcula la base, no el cliente
-- ============================================================================

-- Al confirmarse una compra de un usuario registrado, se acreditan los
-- puntos ($1 = 1 punto, sobre el total efectivamente pagado).
create or replace function public.otorgar_puntos_por_compra()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.usuario_id is not null and new.estado = 'confirmada' then
    insert into public.movimientos_puntos (usuario_id, compra_id, tipo, puntos)
    values (new.usuario_id, new.id, 'ganado', floor(new.total)::integer);
  end if;
  return new;
end;
$$;

create trigger compras_otorgar_puntos
  after insert on public.compras
  for each row
  execute function public.otorgar_puntos_por_compra();

-- Al cancelar una compra (estado pasa A 'cancelada'), se genera el crédito
-- por el total pagado, automáticamente.
create or replace function public.otorgar_credito_por_cancelacion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.estado = 'cancelada' and old.estado <> 'cancelada' and new.usuario_id is not null then
    insert into public.movimientos_credito (usuario_id, compra_id, monto)
    values (new.usuario_id, new.id, new.total);
  end if;
  return new;
end;
$$;

create trigger compras_otorgar_credito
  after update on public.compras
  for each row
  execute function public.otorgar_credito_por_cancelacion();

-- Al insertar un canje: valida que el usuario tenga puntos suficientes
-- (si no, rechaza la operación entera) y descuenta el saldo. El cliente
-- solo dice "quiero esta recompensa" — cuánto cuesta y si le alcanza lo
-- decide la base de datos, no el navegador del cliente.
create or replace function public.procesar_canje()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  saldo integer;
begin
  select coalesce(sum(puntos), 0) into saldo
  from public.movimientos_puntos
  where usuario_id = new.usuario_id;

  if saldo < new.puntos_usados then
    raise exception 'No tenés puntos suficientes para este canje';
  end if;

  insert into public.movimientos_puntos (usuario_id, tipo, puntos)
  values (new.usuario_id, 'canjeado', -new.puntos_usados);

  return new;
end;
$$;

create trigger canjes_procesar
  before insert on public.canjes
  for each row
  execute function public.procesar_canje();


-- ============================================================================
-- 12) RESEÑAS
-- ============================================================================
-- Públicas (tienen que verse antes de comprar, según la consigna).
-- Solo usuarios registrados pueden escribir la suya.

create policy resenas_select on public.resenas
  for select to anon, authenticated using (true);

create policy resenas_insert on public.resenas
  for insert to authenticated
  with check (usuario_id = auth.uid());

create policy resenas_update on public.resenas
  for update to authenticated
  using (usuario_id = auth.uid());

create policy resenas_delete on public.resenas
  for delete to authenticated
  using (usuario_id = auth.uid() or rol_actual() = 'admin');


-- ============================================================================
-- 13) ALERTAS DE ESTRENO
-- ============================================================================
-- Privadas: cada uno administra las suyas. "notificada" no la toca el
-- cliente (la pondría en true un proceso automático más adelante).

create policy alertas_estreno_select on public.alertas_estreno
  for select to authenticated
  using (usuario_id = auth.uid());

create policy alertas_estreno_insert on public.alertas_estreno
  for insert to authenticated
  with check (usuario_id = auth.uid());

create policy alertas_estreno_delete on public.alertas_estreno
  for delete to authenticated
  using (usuario_id = auth.uid());


-- ============================================================================
-- 14) LOGS DE ACTIVIDAD
-- ============================================================================
-- Solo el admin puede LEER el panel de auditoría. Solo admin/empleado
-- pueden escribir (son quienes hacen las acciones que se registran). Nadie
-- puede editar ni borrar un log ya escrito — si se pudiera, dejaría de
-- servir como auditoría confiable.

create policy logs_actividad_select on public.logs_actividad
  for select to authenticated
  using (rol_actual() = 'admin');

create policy logs_actividad_insert on public.logs_actividad
  for insert to authenticated
  with check (rol_actual() in ('admin', 'empleado'));
