# CINEMA CLUB

Aplicación web de un cine: cartelera, elección de función y butacas, candy bar, combos, cupones, reseñas y compra con entrada en PDF y QR. Tiene tres perfiles: cliente (registrado o anónimo), empleado y administrador.
- **Deploy**: https://cinemaclub-f0a35.web.app
- **Documento de requerimientos**: [Requerimientos-TP1.pdf](Requerimientos-TP1.pdf)

## Tecnologías

- **Angular 22**: componentes standalone, signals, Reactive Forms y control flow (`@if`, `@for`).
- **Supabase**: autenticación con mail y contraseña y base de datos PostgreSQL.
- **Firebase Hosting**: publicación de la aplicación.
- **PWA**: manifest y service worker de Angular.
- **jsPDF** y **qrcode**: comprobante en PDF con su QR.

## Qué incluye la aplicación

### Acceso
- Registro de clientes con los datos solicitados (mail, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y días de vacaciones) y login con email y contraseña (Supabase Auth).
- Ingreso anónimo con nombre y apellido, sin crear cuenta.
- Login único: cada usuario entra a la sección de su rol (cliente, empleado o administrador).

### Panel de administración
- Películas: alta, modificación, activación/desactivación, géneros, precios normal, VIP y de preventa, restricción de edad y etapa (Cartelera / Próximamente).
- Salas: al crear una sala se generan automáticamente sus butacas.
- Funciones con asignación automática de sala y 30 minutos libres entre funciones.
- Productos del candy por categoría (bebidas, pochoclos, golosinas, snacks).
- Combos armados con productos y cantidades, con o sin entradas incluidas.
- Cupones de descuento: porcentaje, vigencia (con o sin vencimiento), solo primera compra y edad mínima.
- Alta de empleados y administradores, con listado.
- Log de actividad: quién hizo cada alta, modificación, cambio de precio o validación, con fecha y hora.

### Cliente
- Home: las 3 películas más vendidas, próximos estrenos y combos destacados.
- Cartelera con buscador por nombre y filtro por género.
- Detalle de película: elección de día con pestañas y de horario agrupado por formato e idioma (solo funciones que todavía no empezaron), y las reseñas con su promedio de estrellas.
- Mapa de butacas con butacas normales, accesibles y VIP diferenciadas por color, y las ya vendidas marcadas como ocupadas.
- Candy bar con combos y productos por categoría, y un resumen de compra lateral que se actualiza en vivo.
- Carrito final con el detalle (las VIP resaltadas antes de pagar), cupón de descuento, método de pago simulado y confirmación.
- Al confirmar se guarda la compra en la base y se descarga un PDF con los datos de la función y un QR.
- Mi perfil: datos personales, compras con su estado (pendiente de retiro, retirada o vencida) y reseñas.
- Guards que impiden saltearse pasos del flujo de compra.
- Diseño adaptable al celular.

### Empleado
- Validación de la compra ingresando el código a mano: muestra la película, la función, las butacas y el candy, y al validar el código queda inutilizado.

### PWA
- Manifest, íconos y service worker: se puede instalar como "CINEMA CLUB".

## Organización de carpetas

```
src/app/
├── componentes/
│   ├── publico/      login, registro, ingreso-anonimo, validators
│   ├── compartidos/  layout, navbar, footer
│   ├── admin/        home-admin, gestion-peliculas, gestion-funciones, gestion-salas,
│   │                 gestion-candy, gestion-combos, gestion-cupones,
│   │                 gestion-empleados, log-actividad
│   ├── cliente/      home-cliente, cartelera, detalle-pelicula, mapa-butacas,
│   │                 compra-candy, resumen-carrito, compra-carrito, mi-perfil,
│   │                 carta-pelicula, carta-candy, directivas, pipes
│   └── empleado/     home-empleado
├── servicios/    auth, peliculas, funciones, salas, candy, combos, cupones,
│                 carrito, compras, pdf-compras, perfil, resenas,
│                 escanear-compras, actividad, fechas
├── modelos/      interfaces de cada tabla principal (datos-*.ts, usuario-actual.ts)
├── guards/       role-admin, role-cliente, role-empleado (CanMatchFn),
│                 funcion-elegida, butacas-elegidas (CanActivateFn)
├── directivas/   es-admin, es-empleado (estructurales)
├── app.routes.ts
└── app.config.ts  router + service worker
```

## Navegación y permisos

| Ruta | Componente | Quién entra |
|---|---|---|
| `/` | redirige a `/login` | todos |
| `/login` | Login | todos |
| `/registro` | Registro | todos |
| `/ingresoAnonimo` | IngresoAnonimo | todos |
| `/home-cliente` | HomeCliente | cliente o anónimo |
| `/home-cliente/cartelera` | Cartelera | cliente o anónimo |
| `/home-cliente/cartelera/:id` | DetallePelicula | cliente o anónimo |
| `/home-cliente/butacas/:id` | MapaButacas | cliente o anónimo que eligió esa función |
| `/home-cliente/candy` | CompraCandy | cliente o anónimo que eligió butacas |
| `/home-cliente/carrito` | CompraCarrito | cliente o anónimo que eligió butacas |
| `/home-cliente/mi-perfil` | MiPerfil | cliente |
| `/home-admin` + `peliculas`, `funciones`, `salas`, `candy`, `combos`, `cupones`, `empleados`, `logs` | gestiones y log | administrador |
| `/home-empleado` | HomeEmpleado (validar compras) | empleado |
| `**` | redirige a `/login` | — |

Las tres secciones (`home-admin`, `home-cliente`, `home-empleado`) cargan el `Layout`, que tiene el navbar y el `router-outlet` donde aparecen las pantallas hijas. Todos los componentes se cargan con `loadComponent`.

## Modelo de datos

| Tabla | Qué guarda |
|---|---|
| `usuarios` | Datos del registro y rol. Su `id` es el del usuario en Supabase Auth |
| `peliculas` | Datos, géneros, precios, restricción de edad, etapa y estado |
| `salas` y `butacas` | Cada sala y sus butacas, con fila, columna, tipo y si está activa |
| `funciones` | Película, sala, inicio, fin, fin de bloqueo, formato e idioma |
| `compras` | Usuario (o `null` si es anónimo), totales, cupón, método de pago y código |
| `entradas` | Una por butaca comprada, con su función, precio y estado |
| `candy_vendido` | Productos y combos de cada compra, con cantidad, precio y estado |
| `categorias_candy`, `productos_candy` | El candy bar |
| `combos`, `combo_productos` | Los combos y los productos que incluye cada uno |
| `cupones` | Código, porcentaje, vigencia, primera compra y edad mínima |
| `resenas` | Estrellas y comentario por usuario y película (una sola por par) |
| `log_actividad` | Usuario, acción, detalle y fecha |

Las relaciones se resuelven con claves foráneas, y las consultas traen los datos relacionados con selects anidados (por ejemplo, una compra con sus entradas, su función y su película).

## Reglas de negocio

### Salas y butacas

Todas las salas tienen la misma forma: 20 filas (A a T) con bloques de 4, 20 y 4 butacas, y dos pasillos. Las butacas se generan desde Angular al crear la sala (`Salas.generarButacas`), una fila por butaca en la tabla `butacas` con su `fila`, `columna`, `tipo` (`normal`, `accesible` o `vip`) y si está `activa`.

- La fila **K** se genera inactiva y la **J** tiene activas solo las 14 butacas accesibles (2 - 10 - 2), así en el mapa queda el espacio de la fila que se quitó.
- Las filas **R, S y T** son VIP.
- Una butaca figura ocupada en una función si hay una entrada de esa función que no esté cancelada.

Uso una tabla de butacas para que cada entrada apunte a una butaca real (clave foránea entradas.butaca_id) y para guardar en cada una su tipo y si se vende o no: así la fila K y los lugares libres de la J existen en el mapa pero no se pueden elegir.

### Precio de las entradas

El precio depende de la película: cada una define su `precio_base` y su `precio_vip`, y el carrito usa uno u otro según el tipo de butaca. La película también guarda `precio_preventa` y `dias_preventa` para la preventa.

### Armado de funciones

La sala se asigna sola: al crear una función se busca la primera sala que no tenga otra función en ese horario. Cada función guarda su `fin` (inicio + duración de la película) y su `fin_bloqueo` (fin + 30 minutos), y el choque de horarios se controla contra `fin_bloqueo`, así siempre quedan 30 minutos entre funciones. Esta validación está en el código de Angular.

### Perfiles de usuario

Cada persona está en la tabla `usuarios`, con una columna `rol` (`cliente`, `empleado` o `admin`). El registro público siempre crea clientes; a los empleados los da de alta el administrador. Como el `signUp` de Supabase deja logueado al usuario que crea, el alta usa un segundo cliente de Supabase que no guarda sesión, así el administrador no pierde la suya. El anónimo no se guarda en Supabase: su nombre y apellido quedan en el servicio `Auth` mientras dura la sesión.

### Recorrido de compra

Película → función → butacas → candy → carrito, cada paso en su pantalla. Lo que se va eligiendo (película, función, butacas, candy y combo) queda en el servicio `Carrito`, y cada pantalla lo lee de ahí.

Se puede llegar al pago de dos formas:
- **Sin combo:** cartelera → detalle → butacas → candy → carrito. El candy es opcional.
- **Con combo destacado:** el cliente elige un combo con entradas desde el home, después la película y la función, elige tantas butacas como entradas trae el combo y pasa directo al carrito, porque el combo ya incluye el candy.

### Restricción de edad

Las películas pueden ser para todo público, +13 o +18. Un usuario registrado menor a la restricción no puede comprar. Al anónimo no se le valida la edad, porque no se conoce. En todos los casos la entrada sale con la aclaración de que los menores van con un adulto.

### Cupones

Al aplicar un cupón se controla que exista, esté activo y vigente. Si es de primera compra o tiene edad mínima, además exige un usuario registrado, que no tenga compras anteriores o que cumpla la edad.

### Reseñas

Se leen en el detalle de la película, antes de comprar. Se escriben desde Mi perfil: solo se puede opinar de una película que se compró y cuya entrada fue validada por el empleado, y una sola vez (la base tiene una regla que lo impide).

### Combos

Un combo con `cantidad_entradas > 0` es un **combo destacado**: aparece en el home y su precio fijo cubre las entradas y el candy. Los que tienen `cantidad_entradas = 0` son combos de candy y se ofrecen en la pantalla del candy bar.

### Qué se guarda al comprar

`Compras.crearCompra()` guarda en tres tablas:

1. `compras`: una fila con el total, el método de pago y un código único (`CC-` + fecha y hora en milisegundos). Si compra un anónimo, `usuario_id` queda en `null`.
2. `entradas`: una fila por butaca, con su precio. Con combo destacado, las entradas se guardan en $0 y con el `combo_id`.
3. `candy_vendido`: una fila por producto o combo, con el precio que tenía en ese momento en `precio_unitario`. El combo destacado va acá con su precio completo, así entradas + candy siempre suma lo que se pagó.

### Comprobante

Cada compra tiene **un solo código** (`compras.qr_code`), que es lo que lleva el QR. Con ese mismo código se entra a la sala y se retira el candy: el empleado lo ingresa, y al validar las entradas pasan a `escaneada` y el candy a `retirado`, así no se puede usar dos veces. Solo se puede validar desde una hora antes de la función y hasta que termina. El PDF se arma en el navegador con la película, la función, la sala, las butacas (marcando las VIP), el candy, el QR y el total, y se descarga al confirmar.

## Arquitectura y criterios técnicos

### Datos y servicios
- El cliente de Supabase se crea una sola vez en el servicio `Auth`; los demás servicios lo piden con `inject(Auth).client()`. Todos los servicios usan `@Service()`, que es lo mismo que `providedIn: 'root'`: hay una única instancia para toda la app.
- Los componentes no consultan la base directamente: siempre pasan por un servicio.
- Cada tabla principal tiene su interfaz en `modelos/`.
- `Carrito` guarda la compra en curso con signals. Las pantallas del flujo no son padre e hijo, entonces no pueden compartir datos con `input`/`output`; al ser un servicio único, lo que guarda una pantalla lo lee la siguiente. Los totales son métodos que leen esas signals, así siempre están actualizados.

### Rutas y guards
- Los guards de rol (`roleAdmin`, `roleCliente`, `roleEmpleado`) son `canMatch` y están en la ruta padre de cada sección: si no tenés el rol, el router sigue buscando, llega al `**` y te manda al login.
- Los guards del flujo (`funcionElegida`, `butacasElegidas`) son `canActivate`: si entrás a butacas, candy o carrito sin haber hecho el paso anterior, cortan la navegación y te mandan a la cartelera.
- `paramMap` se usa como Observable para leer el id de la URL, y la suscripción se cierra en `ngOnDestroy`.
- Todas las pantallas usan lazy loading: el código de cada una se descarga recién al entrar.

### Componentes y vistas
- `*appEsAdmin` y `*appEsEmpleado` son directivas estructurales que muestran u ocultan links del navbar según el rol. Solo afectan lo que se ve; lo que protege el acceso son los guards.
- `appCardComprar` es una directiva de atributo que con `host` escucha `mouseenter` / `mouseleave` y muestra el overlay con los datos y el botón en las cartas.
- `CartaPelicula` y `CartaCandy` se reutilizan en varias pantallas con `input` / `output`. `CartaCandy` recibe el texto del botón y avisa con un `output` cuando la tocan, y la pantalla que la usa decide qué hacer (comprar el combo o sumarlo al carrito).
- Los pipes propios `filtro` y `genero` filtran la cartelera por nombre y por género, encadenados; `currency`, `date` y `number` dan formato a precios, fechas y promedios.
- Registro, login, ingreso anónimo y las gestiones del admin usan Reactive Forms con validaciones, y el botón queda deshabilitado mientras el formulario no es válido. Las fechas y horas se escriben como texto y se controlan con validadores propios (`FechaValidator`, `HoraValidator`).
- Las conversiones de fecha y el cálculo de edad están en el servicio `Fechas`, que comparten varias pantallas.
- Las plantillas usan el control flow nuevo (`@if`, `@for`, `@else`).

### Librerías y deploy
- jsPDF arma el PDF y qrcode genera la imagen del QR, todo del lado del navegador.
- La app está en Firebase Hosting. Todas las rutas se redirigen a `index.html` para que, si se recarga estando en una pantalla interna, Angular pueda resolverla.


