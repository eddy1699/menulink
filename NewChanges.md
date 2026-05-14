# CLAUDE.md — MenuQR Perú

> Archivo de instrucciones para Claude Code.
> Fuente de verdad técnica y de negocio para este proyecto.
> Leer completo antes de escribir cualquier línea de código.

---

## 1. QUÉ ES ESTE PROYECTO

**MenuQR Perú** es una plataforma SaaS multitenant que permite a restaurantes peruanos digitalizar su carta, compartirla mediante link único o código QR, y gestionarla en tiempo real.

- URL pública de cada restaurante: `https://menuqr.pe/{slug}`
- El comensal final **no necesita login ni app**. Solo escanea el QR.
- El restaurante gestiona todo desde un dashboard web.
- Existen dos roles internos: `RESTAURANT_ADMIN` y `SUPERADMIN`.

**Modelo de negocio (actualizado):**
El producto es **gratuito para el restaurante**. Las fuentes de ingreso son:
1. **Publicidad** en el menú público (banners CPM/CPC para marcas como Backus, Rappi, Inca Kola).
2. **Branding "Potenciado por MenuQR"** en el footer de cada menú público (no removible en plan gratuito).
3. **Servicios de valor agregado** pagados por el restaurante si los quiere:
   - Onboarding asistido: S/ 120 único (el equipo carga el menú completo).
   - Kit QR físico impreso: S/ 35–50.
   - Fotografía de platos coordinada: S/ 150–300.
   - Soporte prioritario WhatsApp: S/ 19.90/mes.

---

## 2. STACK TÉCNICO

### Frontend
- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript estricto — `strict: true`, **prohibido usar `any`**
- **Estilos:** Tailwind CSS
- **Componentes UI:** shadcn/ui
- **Iconos:** Lucide React
- **Formularios:** React Hook Form + Zod (validación en cliente Y servidor)
- **Estado global:** Zustand
- **QR:** `qrcode.react`
- **Drag & Drop:** `@dnd-kit/core`
- **i18n:** `next-intl` (ES / EN / PT)
- **Charts:** Recharts
- **Fuentes:** Playfair Display (headings) + DM Sans (body) — Google Fonts

### Backend
- **API:** Next.js API Routes (primary) — FastAPI opcional
- **Base de datos:** PostgreSQL vía Supabase
- **ORM:** Prisma
- **Auth:** NextAuth.js v5 — credentials provider + JWT
- **Storage de imágenes:** Supabase Storage (o Cloudinary como alternativa)
- **Email:** Resend

### Infraestructura
- **Hosting:** Vercel
- **DB Hosting:** Supabase

---

## 3. SCHEMA DE BASE DE DATOS (Prisma)

```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  password     String     // bcrypt hash
  name         String
  role         Role       @default(RESTAURANT_ADMIN)
  restaurant   Restaurant?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Restaurant {
  id               String    @id @default(cuid())
  slug             String    @unique  // auto-generado, ver BR1
  name             String
  description      String?
  logoUrl          String?
  primaryColor     String    @default("#C9A96E")
  bgColor          String    @default("#FAF7F2")
  phone            String?
  address          String?
  district         String?
  city             String    @default("Lima")
  isActive         Boolean   @default(true)
  plan             PlanType  @default(STARTER)
  planExpiresAt    DateTime?
  onboardingPaid   Boolean   @default(false)
  languages        String[]  @default(["es"])
  ownerId          String    @unique
  owner            User      @relation(fields: [ownerId], references: [id])
  categories       Category[]
  visits           Visit[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Category {
  id           String     @id @default(cuid())
  name         String
  nameEn       String?
  namePt       String?
  order        Int
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  items        MenuItem[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model MenuItem {
  id              String   @id @default(cuid())
  name            String
  nameEn          String?
  namePt          String?
  description     String?
  descriptionEn   String?
  descriptionPt   String?
  price           Decimal  // en S/ (PEN)
  imageUrl        String?
  isAvailable     Boolean  @default(true)
  order           Int
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id])
  allergens       String[] // ["Gluten","Lácteos","Mariscos","Huevo","Frutos secos","Soya"]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Visit {
  id           String     @id @default(cuid())
  restaurantId String
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])
  source       String?    // "qr" | "link" | "direct"
  language     String?    // "es" | "en" | "pt"
  createdAt    DateTime   @default(now())
}

model OnboardingRequest {
  id             String   @id @default(cuid())
  name           String
  email          String
  phone          String
  restaurantName String
  message        String?
  status         String   @default("pending") // "pending" | "in_progress" | "done"
  createdAt      DateTime @default(now())
}

enum Role {
  SUPERADMIN
  RESTAURANT_ADMIN
}

enum PlanType {
  STARTER
  PRO
  BUSINESS
}
```

---

## 4. MODELO DE PUBLICIDAD (nuevo — no en spec original)

### Tabla adicional en Prisma

```prisma
model Ad {
  id           String   @id @default(cuid())
  advertiser   String   // nombre del anunciante
  imageUrl     String
  linkUrl      String
  altText      String
  placement    AdPlacement
  isActive     Boolean  @default(true)
  startDate    DateTime
  endDate      DateTime?
  impressions  Int      @default(0)
  clicks       Int      @default(0)
  cpmRate      Decimal? // S/ por mil impresiones
  cpcRate      Decimal? // S/ por clic
  createdAt    DateTime @default(now())
}

model AdImpression {
  id           String   @id @default(cuid())
  adId         String
  restaurantId String   // en qué restaurante se mostró
  source       String?  // "qr" | "link" | "direct"
  language     String?
  createdAt    DateTime @default(now())
}

enum AdPlacement {
  BETWEEN_CATEGORIES   // entre secciones del menú (cada 2-3)
  MENU_FOOTER          // al final del menú, antes del branding
  DASHBOARD_BANNER     // en el dashboard del restaurante admin
}
```

### Lógica de negocio para ads

- Los banners se muestran en `/[slug]` (menú público).
- El registro de impresión es **fire & forget** — igual que `Visit`. Nunca bloquea el render.
- El click abre `linkUrl` en nueva pestaña.
- `DASHBOARD_BANNER` es para anunciantes B2B que quieren llegar al dueño del restaurante, no al comensal.

---

## 5. RUTAS

### Públicas
| Ruta | Propósito |
|------|-----------|
| `/` | Landing page |
| `/demo` | Demo con datos hardcodeados de "La Cevichería Limeña" (NO consulta BD) |
| `/planes` | Página de precios |
| `/login` | Login para restaurant_admin y superadmin |
| `/registro` | Registro de nuevo restaurante |
| `/onboarding` | Formulario "lo hacemos por ti" |
| `/[slug]` | Menú público del restaurante — `?lang=es|en|pt` `?source=qr` |

### Dashboard (RESTAURANT_ADMIN)
| Ruta | Propósito |
|------|-----------|
| `/dashboard` | Resumen general |
| `/dashboard/menu` | CRUD de categorías y platos |
| `/dashboard/apariencia` | Logo, colores, nombre, descripción |
| `/dashboard/qr` | Ver link + descargar QR (PNG/SVG) + pedir Kit QR físico |
| `/dashboard/analitica` | Estadísticas (solo plan PRO+) |
| `/dashboard/idiomas` | Activar/desactivar idiomas y gestionar traducciones |
| `/dashboard/plan` | Plan actual, upgrade, facturación, servicios adicionales |
| `/dashboard/ajustes` | Datos del restaurante, contraseña, slug, eliminar cuenta |

### Superadmin
| Ruta | Propósito |
|------|-----------|
| `/admin` | Dashboard global |
| `/admin/restaurantes` | Lista de todos los restaurantes |
| `/admin/restaurantes/[id]` | Detalle y edición |
| `/admin/usuarios` | Gestión de usuarios |
| `/admin/onboarding` | Solicitudes de onboarding asistido |
| `/admin/planes` | Configuración de planes y precios |
| `/admin/analitica` | Métricas globales |
| `/admin/publicidad` | Gestión de anuncios (CRUD de `Ad`) |

---

## 6. API ENDPOINTS

```
POST   /api/auth/[...nextauth]       NextAuth handlers
GET    /api/restaurants              Lista restaurantes (superadmin)
POST   /api/restaurants              Crear restaurante
GET    /api/restaurants/[id]         Obtener restaurante
PATCH  /api/restaurants/[id]         Actualizar restaurante
DELETE /api/restaurants/[id]         Eliminar restaurante

GET    /api/menu/categories          Listar categorías del restaurante autenticado
POST   /api/menu/categories          Crear categoría
PATCH  /api/menu/categories/[id]     Actualizar categoría
DELETE /api/menu/categories/[id]     Eliminar categoría
PATCH  /api/menu/categories/reorder  Reordenar drag & drop

GET    /api/menu/items               Listar platos
POST   /api/menu/items               Crear plato
PATCH  /api/menu/items/[id]          Actualizar plato
DELETE /api/menu/items/[id]          Eliminar plato
PATCH  /api/menu/items/[id]/toggle   Toggle isAvailable (rápido, sin abrir editor)

POST   /api/upload                   Subir imagen → WebP → Supabase Storage
POST   /api/visits                   Registrar visita (fire & forget)

GET    /api/admin/restaurants        Lista todos los restaurantes
PATCH  /api/admin/restaurants/[id]   Cambiar plan, activar/desactivar, extender vencimiento
GET    /api/admin/stats              Métricas globales para superadmin

GET    /api/ads                      Obtener ads activos para un placement
POST   /api/ads/impression           Registrar impresión (fire & forget)
POST   /api/ads/click                Registrar clic
GET    /api/admin/ads                CRUD de anuncios (superadmin)
```

---

## 7. REGLAS DE NEGOCIO CRÍTICAS

### BR1 — Slug auto-generado
```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
// Si colisión en DB → sufijo numérico: "la-cevicheria-limena-2"
```

### BR2 — Formato de moneda
```typescript
const formatPEN = (amount: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);
// Output: "S/ 39.90"
```

### BR3 — Fotos solo en PRO y BUSINESS
- En STARTER, el botón de subir foto debe mostrar un **modal de upgrade**.
- Validar en Server Action ANTES de procesar el upload.

### BR4 — Conversión a WebP
- Toda imagen subida se convierte a WebP.
- Path en Supabase Storage: `restaurantes/{restaurantId}/items/{itemId}.webp`

### BR5 — Validación de upload
```typescript
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 2;
```

### BR6 — Límites de plan (evaluar en Server Action)
| Plan | Items | Categorías | Fotos | Analytics | Menús | Sucursales |
|------|-------|------------|-------|-----------|-------|------------|
| STARTER | 20 | 10 | ❌ | ❌ | 1 | 1 |
| PRO | 80 | 20 | 80 | basic | 3 | 1 |
| BUSINESS | ∞ | ∞ | ∞ | full | ∞ | ∞ |

### BR7 — Plan vencido
- El menú público **sigue visible**.
- El admin ve un **banner de renovación** en el dashboard.

### BR8 — Restaurante inactivo
```typescript
if (!restaurant.isActive) {
  // Mostrar: "Este restaurante pausó su carta" + CTA a landing
}
```

### BR9 — Slug inexistente
```typescript
// 404 con mensaje: "Esta carta no existe" + CTA a landing
notFound();
```

### BR10 — Visitas fire & forget
```typescript
// En el componente del menú público:
useEffect(() => {
  fetch("/api/visits", {
    method: "POST",
    body: JSON.stringify({ restaurantId, source, language }),
  }).catch(() => {}); // silencioso — nunca bloquea el render
}, []);
```

### BR11 — Source de visita
```typescript
function getVisitSource(searchParams: URLSearchParams, referrer: string): string {
  if (searchParams.get("source") === "qr") return "qr";
  if (referrer && !referrer.includes("menuqr.pe")) return "link";
  return "direct";
}
```

### BR12 — Detección de idioma
1. Leer `?lang=` del query param.
2. Si no, detectar `navigator.language` del visitante.
3. Verificar si ese idioma está en `restaurant.languages`.
4. Fallback: primer idioma de `restaurant.languages` (siempre `["es"]` como mínimo).

### BR13 — Middleware de autenticación
```typescript
// middleware.ts
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

// /dashboard/* → requiere RESTAURANT_ADMIN o SUPERADMIN
// /admin/*     → solo SUPERADMIN
// /login       → redirige si ya autenticado
// /registro    → redirige si ya autenticado
// /[slug]      → siempre público
// /demo        → siempre público
```

### BR14 — Demo sin BD
- `/demo` usa datos hardcodeados del restaurante "La Cevichería Limeña".
- Mismos componentes que `/[slug]` pero sin llamada a Prisma.
- Paleta: `primaryColor: "#1B4F72"`, `bgColor: "#EAF4FB"`

### BR19 — TypeScript estricto
- **Prohibido `any`** en todo el codebase.
- Validar con Zod en todos los formularios Y en todos los API routes.

### BR20 — Server vs Client Components
- **Server Components por defecto.**
- Client Components (`"use client"`) solo cuando hay: `useState`, `useEffect`, `useRef`, event listeners, o hooks de terceros.

---

## 8. IDENTIDAD VISUAL

```typescript
export const brandColors = {
  dark:   "#1A1208",  // textos principales, fondo oscuro
  gold:   "#C9A96E",  // acento, CTA, logo
  cream:  "#FAF7F2",  // fondo principal
  warm:   "#F5EFE3",  // fondo secundario
  border: "#E8E0D0",  // bordes y separadores
  muted:  "#8B7355",  // textos secundarios
} as const;
```

- **Headings:** `font-family: 'Playfair Display', serif`
- **Body/UI:** `font-family: 'DM Sans', sans-serif`
- **QR color:** siempre `restaurant.primaryColor`

---

## 9. INTERNACIONALIZACIÓN (i18n)

- Librería: `next-intl`
- Idiomas: `es` (default), `en`, `pt`
- Los campos traducibles en BD: `nameEn`, `namePt`, `descriptionEn`, `descriptionPt` en `MenuItem` y `Category`.
- El restaurante activa idiomas en `/dashboard/idiomas`.
- `restaurant.languages` es un array, default `["es"]`.

---

## 10. SISTEMA DE PUBLICIDAD

### Lógica de renderizado en `/[slug]`

```typescript
// Mostrar un banner cada 2 categorías
{categories.map((cat, index) => (
  <>
    <CategorySection key={cat.id} category={cat} />
    {index > 0 && index % 2 === 0 && (
      <AdBanner placement="BETWEEN_CATEGORIES" restaurantId={restaurant.id} />
    )}
  </>
))}
<AdBanner placement="MENU_FOOTER" restaurantId={restaurant.id} />
<PoweredByMenuQR /> {/* branding fijo, no removible */}
```

### Componente AdBanner

```typescript
// El componente registra impresión al montar (fire & forget)
// Al hacer clic registra el evento y abre linkUrl en nueva pestaña
// Si no hay ads activos para el placement, no renderiza nada (null)
```

### Footer de branding (no removible)

```tsx
<footer className="text-center py-4 text-sm text-muted">
  Carta digital por{" "}
  <a href="https://menuqr.pe" className="font-semibold text-brand-gold">
    MenuQR
  </a>{" "}
  🍽️ —{" "}
  <a href="https://menuqr.pe/registro" className="underline">
    Crea la tuya gratis
  </a>
</footer>
```

---

## 11. ESTRUCTURA DE CARPETAS ESPERADA

```
/
├── app/
│   ├── [slug]/               # menú público
│   ├── demo/                 # demo hardcodeada
│   ├── dashboard/            # área autenticada restaurant_admin
│   │   ├── menu/
│   │   ├── apariencia/
│   │   ├── qr/
│   │   ├── analitica/
│   │   ├── idiomas/
│   │   ├── plan/
│   │   └── ajustes/
│   ├── admin/                # área superadmin
│   │   ├── restaurantes/
│   │   ├── usuarios/
│   │   ├── onboarding/
│   │   ├── planes/
│   │   ├── analitica/
│   │   └── publicidad/       # gestión de ads
│   ├── login/
│   ├── registro/
│   ├── onboarding/
│   ├── planes/
│   └── page.tsx              # landing
├── components/
│   ├── menu/                 # componentes del menú público
│   ├── dashboard/            # componentes del admin
│   ├── ads/                  # AdBanner, PoweredByMenuQR
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── auth.ts               # NextAuth config
│   ├── slug.ts               # generateSlug()
│   ├── currency.ts           # formatPEN()
│   └── plan-limits.ts        # checkPlanLimits()
├── prisma/
│   ├── schema.prisma
│   └── seed.ts               # seed con Cevichería Limeña + superadmin
├── middleware.ts
└── CLAUDE.md                 # este archivo
```

---

## 12. SEED DE BASE DE DATOS

El seed debe crear:

```typescript
// 1. Superadmin
{ email: "admin@menuqr.pe", role: "SUPERADMIN", name: "Admin MenuQR" }

// 2. Restaurante demo (para desarrollo local — en prod la /demo es hardcodeada)
{
  slug: "la-cevicheria-limena",
  name: "La Cevichería Limeña",
  primaryColor: "#1B4F72",
  bgColor: "#EAF4FB",
  plan: "PRO",
  owner: { email: "demo@cevicherialimena.pe" }
}
// Con categorías: "Entradas", "Ceviches", "Fondos", "Bebidas"
// Y platos con precio en S/ incluyendo: ceviche, leche de tigre, causa limeña, chicha morada
```

---

## 13. VARIABLES DE ENTORNO REQUERIDAS

```env
# Base de datos
DATABASE_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Email
RESEND_API_KEY=
EMAIL_FROM=hola@menuqr.pe

# App
NEXT_PUBLIC_APP_URL=https://menuqr.pe
```

---

## 14. QUÉ NO IMPLEMENTAR (out of scope)

- ❌ Pagos en línea / pasarela de pagos para el comensal
- ❌ App móvil nativa
- ❌ Integración con POS o sistemas de comanda
- ❌ Carrito / pedidos (MenuQR es solo carta digital)
- ❌ Notificaciones push
- ❌ Reservas de mesa
- ❌ Programa de fidelidad o cupones
- ❌ Facturación electrónica SUNAT (TBD)

---

## 15. CONVENCIONES DE CÓDIGO

- **Componentes:** PascalCase — `MenuItemCard.tsx`
- **Hooks:** camelCase con prefijo `use` — `useRestaurant.ts`
- **Utilidades:** camelCase — `generateSlug.ts`
- **Constantes globales:** UPPER_SNAKE_CASE — `MAX_UPLOAD_SIZE_MB`
- **API routes:** REST semántico, respuesta con `{ data, error }`
- **Errores:** siempre lanzar con mensaje descriptivo, nunca swallow silencioso (excepto fire & forget)
- **Server Actions:** validar plan limits ANTES de cualquier mutación
- **Zod:** definir schemas en `/lib/schemas/` y reutilizar entre cliente y servidor

---

## 16. DATOS PARA NO INVENTAR

Los siguientes datos están **TBD** en el spec — no asumas ni inventes valores:

- Métodos de pago (¿Stripe? ¿Yape? ¿Plin?) — aún no definido
- Free trial — no existe por ahora
- Programa de referrals o descuentos — no existe por ahora
- Normativa legal (INDECOPI, Ley 29733, SUNAT) — pendiente revisión legal
- Número de teléfono / WhatsApp de soporte
- URL del help center

---

*Última actualización: 2026-05-14 | Versión: 1.1.0 (agrega modelo freemium + publicidad)*