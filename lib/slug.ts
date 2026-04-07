export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quita tildes: á→a, é→e
    .replace(/[^a-z0-9\s-]/g, '')     // solo letras, números y guiones
    .trim()
    .replace(/\s+/g, '-')             // espacios → guiones
    .replace(/-+/g, '-')              // guiones dobles → uno solo
    .replace(/^-|-$/g, '')            // quita guiones al inicio/fin
}
