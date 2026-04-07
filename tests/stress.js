import http from 'k6/http'
import { sleep, check } from 'k6'

// ── Configuración del test ──
// Cambia la URL base a tu dominio
const BASE_URL = 'https://karta-peru.netlify.app'

// Slugs de restaurantes reales para simular visitas
const SLUGS = ['pepito', 'asa']  // agrega más slugs si tienes

export const options = {
  scenarios: {
    // Escenario 1: carga normal (warm-up)
    carga_normal: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // sube a 10 usuarios en 30s
        { duration: '1m',  target: 10 },   // mantiene 10 usuarios por 1 min
        { duration: '30s', target: 0 },    // baja a 0
      ],
      gracefulRampDown: '10s',
      tags: { scenario: 'normal' },
    },
    // Escenario 2: pico de tráfico
    pico: {
      executor: 'ramping-vus',
      startTime: '2m',  // empieza después del escenario normal
      startVUs: 0,
      stages: [
        { duration: '20s', target: 50 },   // sube rápido a 50 usuarios
        { duration: '1m',  target: 50 },   // mantiene el pico
        { duration: '20s', target: 0 },
      ],
      gracefulRampDown: '10s',
      tags: { scenario: 'pico' },
    },
    // Escenario 3: estrés real
    estres: {
      executor: 'ramping-vus',
      startTime: '4m',  // empieza después del pico
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },  // 100 usuarios simultáneos
        { duration: '1m',  target: 100 },
        { duration: '30s', target: 200 },  // sube a 200
        { duration: '1m',  target: 200 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
      tags: { scenario: 'estres' },
    },
  },
  // Umbrales de éxito
  thresholds: {
    http_req_failed:   ['rate<0.05'],         // menos del 5% de errores
    http_req_duration: ['p(95)<3000'],        // 95% de requests bajo 3s
    'http_req_duration{scenario:normal}': ['p(95)<1500'],  // normal debe ser más rápido
    'http_req_duration{scenario:pico}':   ['p(95)<2500'],
  },
}

export default function () {
  const slug = SLUGS[Math.floor(Math.random() * SLUGS.length)]

  // 1. Visita la carta pública (la más crítica)
  const menuRes = http.get(`${BASE_URL}/${slug}`, {
    tags: { page: 'carta_publica' },
  })
  check(menuRes, {
    'carta carga OK': (r) => r.status === 200,
    'carta responde < 3s': (r) => r.timings.duration < 3000,
  })

  sleep(1)

  // 2. Landing page
  const landingRes = http.get(`${BASE_URL}/`, {
    tags: { page: 'landing' },
  })
  check(landingRes, {
    'landing OK': (r) => r.status === 200,
  })

  sleep(Math.random() * 2 + 1) // espera 1-3s entre acciones (simula usuario real)
}
