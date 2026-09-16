-- ============================================================================
-- TP1 Programación IV — Sistema de cine
-- Modelo de base de datos para Supabase (PostgreSQL)
-- ============================================================================
-- Cómo usarlo: Supabase → tu proyecto → SQL Editor → pegar todo → Run.
-- ============================================================================

-- Necesaria para el EXCLUDE constraint de "funciones" (evita solapamiento de salas)
create extension if not exists btree_gist;


-- ============================================================================
-- A) USUARIOS (clientes, admin y empleados, distinguidos por "rol")
-- ============================================================================
-- Supabase ya tiene auth.users (login, password, sesión) — esta tabla NO
-- lo reemplaza, guarda los datos EXTRA que pide el enunciado, 1 a 1 con
-- auth.users, para cualquier persona (rol cliente, empleado o admin).
-- "mail" se duplica a propósito: auth.users no se puede leer directo desde
-- el cliente (ni con RLS normal), y el admin necesita poder listar/buscar
-- usuarios por mail.

create table public.usuarios (
  id                    uuid primary key references auth.users(id) on delete cascade,
  mail                  text not null unique,
  nombre                text not null,
  apellido              text not null,
  fecha_nacimiento      date not null,
  tipo_sangre           text,
  color_ojos            text,
  dias_vacaciones_anio  integer,
  rol                   text not null default 'cliente'
                          check (rol in ('cliente', 'empleado', 'admin')),
  creado_en             timestamptz not null default now()
);

-- Nota: las compras anónimas NO tienen fila en usuarios ni en auth.users.
-- Por eso compras.usuario_id (más abajo) puede ser NULL.


-- ============================================================================
-- B) CATÁLOGO DE PELÍCULAS
-- ============================================================================

create table public.generos (
  id      bigint generated always as identity primary key,
  nombre  text not null unique
);

create table public.peliculas (
  id                  bigint generated always as identity primary key,
  nombre              text not null,
  sinopsis            text,
  imagen_url          text,
  duracion_minutos    integer not null,
  restriccion_edad    integer not null default 0
                        check (restriccion_edad in (0, 13, 18)),
  fecha_estreno       date not null,
  -- precio "de lista" de la película. VIP y preventa son las dos únicas
  -- variaciones que pide el enunciado (nada varía por sala/horario/formato).
  precio_base         numeric(10,2) not null,
  precio_vip          numeric(10,2) not null,
  precio_preventa     numeric(10,2),
  dias_preventa       integer not null default 7,
  estado              text not null default 'proximamente'
                        check (estado in ('proximamente', 'cartelera', 'finalizada')),
  creado_en           timestamptz not null default now()
);

-- una película puede tener varios géneros (N a N)
create table public.pelicula_generos (
  pelicula_id  bigint not null references public.peliculas(id) on delete cascade,
  genero_id    bigint not null references public.generos(id) on delete cascade,
  primary key (pelicula_id, genero_id)
);


-- ============================================================================
-- C) SALAS, BUTACAS Y FUNCIONES
-- ============================================================================

create table public.salas (
  id      bigint generated always as identity primary key,
  nombre  text not null
);

-- El layout de butacas es siempre el mismo (20 filas, 4-20-4, fila J/K
-- reemplazada por 1 fila accesible 2-10-2, últimas 3 filas VIP). Acá se
-- guarda el resultado de ese layout: una fila por butaca física de cada sala.
create table public.butacas (
  id        bigint generated always as identity primary key,
  sala_id   bigint not null references public.salas(id) on delete cascade,
  fila      text not null,        -- 'A', 'B', ... fila accesible, 'R', 'S', 'T'
  columna   integer not null,
  tipo      text not null default 'normal'
              check (tipo in ('normal', 'accesible', 'vip')),
  unique (sala_id, fila, columna)
);

-- Una función = una película, en una sala, en un horario, con un formato.
create table public.funciones (
  id             bigint generated always as identity primary key,
  pelicula_id    bigint not null references public.peliculas(id),
  sala_id        bigint not null references public.salas(id),
  inicio         timestamptz not null,
  -- fin = fin REAL de la función (inicio + duracion_minutos de la película).
  -- Éste es el que se muestra en pantalla ("termina a las 20:00").
  -- Se calcula en la app antes del insert: fin = inicio + duracion_minutos
  fin            timestamptz not null,
  -- fin_bloqueo = fin + 30 min de buffer. Se usa SOLO para la validación
  -- de solapamiento de abajo, nunca para mostrar en pantalla.
  -- Postgres no deja sumar "timestamptz + interval" adentro de un índice
  -- (esa suma depende de la zona horaria de la sesión, y un índice
  -- necesita algo que dé siempre el mismo resultado) — por eso este
  -- cálculo se hace afuera, en la app, y se guarda ya resuelto:
  -- fin_bloqueo = fin + 30 minutos
  fin_bloqueo    timestamptz not null,
  formato        text not null check (formato in ('2d', '3d', '4d', '5d')),
  idioma         text not null,
  subtitulado    boolean not null default false,
  creado_en      timestamptz not null default now(),

  -- Impide, a nivel de base de datos, dos funciones que se superpongan
  -- en la misma sala (usa fin_bloqueo, que ya incluye el margen de 30 min).
  exclude using gist (
    sala_id with =,
    tstzrange(inicio, fin_bloqueo) with &&
  )
);


-- ============================================================================
-- D) CANDY BAR
-- ============================================================================

create table public.categorias_candy (
  id      bigint generated always as identity primary key,
  nombre  text not null unique
);

create table public.productos_candy (
  id             bigint generated always as identity primary key,
  categoria_id   bigint references public.categorias_candy(id),
  nombre         text not null,
  descripcion    text,
  precio         numeric(10,2) not null,
  imagen_url     text,
  activo         boolean not null default true
);


-- ============================================================================
-- E) COMBOS
-- ============================================================================

create table public.combos (
  id                  bigint generated always as identity primary key,
  nombre              text not null,
  descripcion         text,
  precio              numeric(10,2) not null,
  cantidad_entradas   integer not null default 1,   -- "entradas" en plural en la consigna: puede ser un combo para 2
  destacado           boolean not null default true,
  activo              boolean not null default true
);

create table public.combo_productos (
  combo_id     bigint not null references public.combos(id) on delete cascade,
  producto_id  bigint not null references public.productos_candy(id),
  cantidad     integer not null default 1,
  primary key (combo_id, producto_id)
);


-- ============================================================================
-- F) CUPONES
-- ============================================================================

create table public.cupones (
  id                     bigint generated always as identity primary key,
  codigo                 text unique,
  descripcion            text,
  porcentaje_descuento   numeric(5,2) not null
                           check (porcentaje_descuento > 0 and porcentaje_descuento <= 100),
  solo_primera_compra    boolean not null default false,
  edad_minima            integer,               -- ej 50; NULL = sin restricción
  activo                 boolean not null default true,
  valido_desde           timestamptz default now(),
  valido_hasta           timestamptz
);


-- ============================================================================
-- G) COMPRAS, ENTRADAS Y CANDY VENDIDO
-- ============================================================================

create table public.compras (
  id              bigint generated always as identity primary key,
  usuario_id      uuid references public.usuarios(id),   -- NULL = compra anónima
  fecha           timestamptz not null default now(),
  estado          text not null default 'confirmada'
                    check (estado in ('confirmada', 'cancelada')),
  subtotal        numeric(10,2) not null,
  descuento       numeric(10,2) not null default 0,
  cupon_id        bigint references public.cupones(id),
  puntos_usados   integer not null default 0,
  credito_usado   numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  metodo_pago     text,
  -- UN solo QR por compra (así lo pide el enunciado: "con el mismo QR
  -- puedan retirar" el candy también). El empleado escanea este código,
  -- ve todo lo que incluye la compra (entradas + candy) y va marcando
  -- cada línea como entregada por separado.
  qr_code         text not null unique
);

-- Cada fila = 1 butaca reservada para 1 función, dentro de una compra.
create table public.entradas (
  id           bigint generated always as identity primary key,
  compra_id    bigint not null references public.compras(id) on delete cascade,
  funcion_id   bigint not null references public.funciones(id),
  butaca_id    bigint not null references public.butacas(id),
  combo_id     bigint references public.combos(id),
  precio       numeric(10,2) not null,   -- precio COBRADO en esta compra (no cambia si después cambia el precio de lista)
  estado       text not null default 'vigente'
                 check (estado in ('vigente', 'escaneada', 'cancelada'))
);

-- Impide vender dos veces la misma butaca para la misma función, PERO
-- ignora las entradas canceladas: si cancelás, esa butaca tiene que poder
-- venderse de nuevo. Por eso es un índice único PARCIAL, no un
-- "unique (funcion_id, butaca_id)" común (ese hubiera dejado la butaca
-- bloqueada para siempre después de una cancelación).
create unique index entradas_butaca_activa
  on public.entradas (funcion_id, butaca_id)
  where estado <> 'cancelada';

create table public.candy_vendido (
  id                bigint generated always as identity primary key,
  compra_id         bigint not null references public.compras(id) on delete cascade,
  producto_id       bigint references public.productos_candy(id),
  combo_id          bigint references public.combos(id),
  cantidad          integer not null default 1,
  precio_unitario   numeric(10,2) not null,
  estado            text not null default 'vigente'
                       check (estado in ('vigente', 'retirado', 'cancelado'))
);


-- Reserva corta de una butaca mientras alguien está en medio del checkout
-- (todavía no pagó, todavía no hay fila en "entradas"). Sin esto, dos
-- personas podrían llegar juntas hasta pagar y recién ahí una se entera
-- de que perdió la butaca. Con esto, la butaca se ve "ocupada" para
-- cualquier otro desde el momento en que alguien la selecciona.
create table public.reservas_temporales (
  id           bigint generated always as identity primary key,
  funcion_id   bigint not null references public.funciones(id),
  butaca_id    bigint not null references public.butacas(id),
  usuario_id   uuid references public.usuarios(id),   -- NULL si es un carrito anónimo
  session_id   text,                                   -- para identificar el carrito de un anónimo
  expira_en    timestamptz not null                     -- ej: now() + 10 minutos, se define en la app
);

create unique index reservas_temporales_butaca_activa
  on public.reservas_temporales (funcion_id, butaca_id);
-- Limpieza: la app debe borrar (o directamente ignorar) las filas con
-- expira_en < now() antes de mostrar qué butacas están libres.


-- ============================================================================
-- H) FIDELIZACIÓN: PUNTOS Y RECOMPENSAS
-- ============================================================================
-- El total de puntos NO se guarda como contador aparte: se calcula sumando
-- este historial. De paso, es el "historial de canjes" que pide el enunciado.

create table public.movimientos_puntos (
  id           bigint generated always as identity primary key,
  usuario_id   uuid not null references public.usuarios(id),
  compra_id    bigint references public.compras(id),
  tipo         text not null check (tipo in ('ganado', 'canjeado')),
  puntos       integer not null,     -- positivo si ganado, negativo si canjeado
  fecha        timestamptz not null default now()
);

create table public.recompensas (
  id                   bigint generated always as identity primary key,
  nombre               text not null,
  tipo                 text not null check (tipo in ('entrada_gratis', 'producto_candy')),
  producto_id          bigint references public.productos_candy(id),
  puntos_requeridos    integer not null,
  activo               boolean not null default true
);

create table public.canjes (
  id               bigint generated always as identity primary key,
  usuario_id       uuid not null references public.usuarios(id),
  recompensa_id    bigint not null references public.recompensas(id),
  puntos_usados    integer not null,
  fecha            timestamptz not null default now()
);


-- ============================================================================
-- I) CRÉDITOS (por cancelación de compra)
-- ============================================================================

create table public.movimientos_credito (
  id            bigint generated always as identity primary key,
  usuario_id    uuid not null references public.usuarios(id),
  compra_id     bigint references public.compras(id),
  monto         numeric(10,2) not null,    -- positivo = crédito generado, negativo = crédito usado
  fecha         timestamptz not null default now()
);


-- ============================================================================
-- J) RESEÑAS
-- ============================================================================

create table public.resenas (
  id            bigint generated always as identity primary key,
  usuario_id    uuid not null references public.usuarios(id),
  pelicula_id   bigint not null references public.peliculas(id),
  estrellas     integer not null check (estrellas between 1 and 5),
  comentario    text,
  fecha         timestamptz not null default now(),
  unique (usuario_id, pelicula_id)
);


-- ============================================================================
-- K) ALERTAS DE ESTRENO ("Próximamente")
-- ============================================================================

create table public.alertas_estreno (
  id            bigint generated always as identity primary key,
  usuario_id    uuid not null references public.usuarios(id),
  pelicula_id   bigint not null references public.peliculas(id),
  notificada    boolean not null default false,
  creado_en     timestamptz not null default now(),
  unique (usuario_id, pelicula_id)
);


-- ============================================================================
-- L) AUDITORÍA (log de actividad del admin)
-- ============================================================================

create table public.logs_actividad (
  id            bigint generated always as identity primary key,
  usuario_id    uuid references public.usuarios(id),
  accion        text not null,     -- ej: 'crear_funcion', 'modificar_precio', 'validar_qr'
  entidad       text not null,     -- ej: 'funciones', 'productos_candy', 'entradas'
  entidad_id    text,
  detalle       jsonb,
  fecha         timestamptz not null default now()
);


-- ============================================================================
-- COSAS QUE NO SON TABLAS (se resuelven con consultas / vistas)
-- ============================================================================
-- - "3 películas más vendidas"        -> COUNT(entradas) agrupado por película
-- - "Mis películas" (historial)       -> JOIN entradas + funciones + peliculas + resenas
-- - "Reporte de facturación por día"  -> SUM(compras.total) agrupado por fecha
-- - "Gráfico más vistas por semana"   -> igual, agrupado por semana/mes
