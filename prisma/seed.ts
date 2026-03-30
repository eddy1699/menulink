import { PrismaClient, PlanType, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Superadmin
  const superadminPassword = await bcrypt.hash('admin123', 12)
  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@menuqr.pe' },
    update: {},
    create: {
      email: 'admin@menuqr.pe',
      password: superadminPassword,
      name: 'Administrador MenuQR',
      role: Role.SUPERADMIN,
    },
  })

  console.log('Superadmin created:', superadmin.email)

  // Demo user
  const demoPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@cevicherialimena.pe' },
    update: {},
    create: {
      email: 'demo@cevicherialimena.pe',
      password: demoPassword,
      name: 'Demo Cevichería Limeña',
      role: Role.RESTAURANT_ADMIN,
    },
  })

  // Restaurant 1: La Cevichería Limeña
  const restaurant1 = await prisma.restaurant.upsert({
    where: { slug: 'cevicheria-limena' },
    update: {},
    create: {
      slug: 'cevicheria-limena',
      name: 'La Cevichería Limeña',
      description: 'Los mejores ceviches de Miraflores desde 1985',
      primaryColor: '#1B4F72',
      bgColor: '#EAF4FB',
      district: 'Miraflores',
      city: 'Lima',
      plan: PlanType.PRO,
      languages: ['es', 'en', 'pt'],
      ownerId: demoUser.id,
    },
  })

  // Categories and items for restaurant 1
  await prisma.category.create({
    data: {
      name: 'Entradas',
      nameEn: 'Starters',
      namePt: 'Entradas',
      order: 0,
      restaurantId: restaurant1.id,
      items: {
        create: [
          { name: 'Ceviche Clásico', nameEn: 'Classic Ceviche', price: 28.00, description: 'Con leche de tigre, choclo y cancha serrana', descriptionEn: 'With tiger milk, corn and toasted cancha', allergens: ['mariscos'], order: 0 },
          { name: 'Tiradito de Lenguado', nameEn: 'Flounder Tiradito', price: 32.00, description: 'Salsa amarilla, canchita tostada', allergens: ['mariscos'], order: 1 },
          { name: 'Causa Limeña', nameEn: 'Lima-style Causa', price: 18.00, description: 'Rellena de atún y palta', allergens: ['mariscos'], isAvailable: false, order: 2 },
          { name: 'Leche de Tigre', nameEn: 'Tiger Milk', price: 15.00, description: 'El reconstituyente del mar', allergens: ['mariscos'], order: 3 },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      name: 'Platos de Fondo',
      nameEn: 'Main Courses',
      namePt: 'Pratos Principais',
      order: 1,
      restaurantId: restaurant1.id,
      items: {
        create: [
          { name: 'Arroz con Mariscos', nameEn: 'Rice with Seafood', price: 42.00, description: 'Con choros, camarones y conchas negras', allergens: ['mariscos'], order: 0 },
          { name: 'Chupe de Camarones', nameEn: 'Shrimp Chowder', price: 38.00, description: 'Receta tradicional arequipeña', allergens: ['mariscos', 'lacteos'], order: 1 },
          { name: 'Jalea Mixta', nameEn: 'Mixed Fried Seafood', price: 45.00, description: 'Mariscos fritos, yuca y salsa criolla', allergens: ['mariscos', 'gluten'], order: 2 },
          { name: 'Parihuela', nameEn: 'Seafood Soup', price: 40.00, description: 'Sopa de mariscos estilo limeño', allergens: ['mariscos'], order: 3 },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      name: 'Bebidas',
      nameEn: 'Drinks',
      namePt: 'Bebidas',
      order: 2,
      restaurantId: restaurant1.id,
      items: {
        create: [
          { name: 'Chicha Morada', nameEn: 'Purple Corn Drink', price: 8.00, description: 'Casera, sin azúcar añadida', order: 0 },
          { name: 'Maracuyá Frozen', nameEn: 'Passion Fruit Frozen', price: 10.00, order: 1 },
          { name: 'Inca Kola', price: 6.00, order: 2 },
          { name: 'Pisco Sour', price: 22.00, description: 'Receta de la casa', allergens: ['huevo'], order: 3 },
          { name: 'Agua San Luis 600ml', price: 4.00, isAvailable: false, order: 4 },
        ],
      },
    },
  })

  await prisma.category.create({
    data: {
      name: 'Postres',
      nameEn: 'Desserts',
      namePt: 'Sobremesas',
      order: 3,
      restaurantId: restaurant1.id,
      items: {
        create: [
          { name: 'Suspiro a la Limeña', nameEn: 'Lima-style Suspiro', price: 12.00, description: 'Con manjar blanco y merengue', allergens: ['lacteos', 'huevo'], order: 0 },
          { name: 'Mazamorra Morada', nameEn: 'Purple Corn Pudding', price: 10.00, description: 'Receta de abuela', order: 1 },
          { name: 'Picarones con Miel de Chancaca', nameEn: 'Picarones with Chancaca Honey', price: 14.00, description: 'Fritos al momento', allergens: ['gluten'], order: 2 },
        ],
      },
    },
  })

  // Restaurant 2: Anticuchos Don Pepe
  const demoUser2 = await prisma.user.upsert({
    where: { email: 'donpepe@anticuchos.pe' },
    update: {},
    create: {
      email: 'donpepe@anticuchos.pe',
      password: await bcrypt.hash('demo123', 12),
      name: 'Don Pepe',
      role: Role.RESTAURANT_ADMIN,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: 'anticuchos-don-pepe' },
    update: {},
    create: {
      slug: 'anticuchos-don-pepe',
      name: 'Anticuchos Don Pepe',
      description: 'Tradición anticuchera en el corazón de Surco',
      primaryColor: '#922B21',
      bgColor: '#FDF2F2',
      district: 'Santiago de Surco',
      city: 'Lima',
      plan: PlanType.STARTER,
      ownerId: demoUser2.id,
    },
  })

  await prisma.category.create({
    data: {
      name: 'Anticuchos',
      order: 0,
      restaurantId: restaurant2.id,
      items: {
        create: [
          { name: 'Anticucho de Corazón', price: 22.00, description: 'Brocheta de corazón de res con ají panca', order: 0 },
          { name: 'Anticucho Mixto', price: 28.00, description: 'Corazón, pollo y chorizo', order: 1 },
          { name: 'Anticucho de Pollo', price: 20.00, description: 'Con papas y choclo', order: 2 },
        ],
      },
    },
  })

  console.log('Seed completed successfully!')
  console.log('Superadmin: admin@menuqr.pe / admin123')
  console.log('Demo: demo@cevicherialimena.pe / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
