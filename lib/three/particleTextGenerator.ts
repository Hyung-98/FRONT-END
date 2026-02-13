import * as THREE from 'three'

export interface TextParticleOptions {
  fontSize: number
  fontFamily: string
  density: number // 0.3-0.5 recommended (sample every 2-3 pixels)
  canvasWidth?: number
  canvasHeight?: number
  randomness?: number // ±offset for organic look (default: 0.2)
}

/**
 * Generate 3D particle positions from text using canvas pixel sampling
 * @param text - Text to convert to particles
 * @param options - Configuration options
 * @returns Array of THREE.Vector3 positions
 */
export function generateTextParticles(text: string, options: TextParticleOptions): THREE.Vector3[] {
  const {
    fontSize,
    fontFamily,
    density,
    canvasWidth = 1024,
    canvasHeight = 256,
    randomness = 0.2,
  } = options

  // Create offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('Failed to get 2D context')
    return []
  }

  // Fill black background
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Draw white text
  ctx.fillStyle = 'white'
  ctx.font = `bold ${fontSize}px ${fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2)

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
  const pixels = imageData.data

  const positions: THREE.Vector3[] = []
  const sampleStep = Math.ceil(1 / density)

  // Sample pixels with density control
  for (let y = 0; y < canvasHeight; y += sampleStep) {
    for (let x = 0; x < canvasWidth; x += sampleStep) {
      const i = (y * canvasWidth + x) * 4
      const brightness = pixels[i] // Red channel (grayscale)

      // If pixel is bright enough (text pixel)
      if (brightness > 128) {
        // Convert 2D pixel coords to centered 3D coords
        const x3d = (x - canvasWidth / 2) / 50 + (Math.random() - 0.5) * randomness
        const y3d = -(y - canvasHeight / 2) / 50 + (Math.random() - 0.5) * randomness
        const z3d = (Math.random() - 0.5) * randomness

        positions.push(new THREE.Vector3(x3d, y3d, z3d))
      }
    }
  }

  return positions
}

/**
 * Generate random initial positions for particles (radial spread)
 * @param count - Number of particles
 * @param spreadRadius - How far particles spread from center
 * @returns Array of THREE.Vector3 positions
 */
export function generateRandomPositions(count: number, spreadRadius: number = 8): THREE.Vector3[] {
  const positions: THREE.Vector3[] = []

  for (let i = 0; i < count; i++) {
    // Random spherical coordinates
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(Math.random() * 2 - 1)
    const radius = Math.random() * spreadRadius

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    positions.push(new THREE.Vector3(x, y, z))
  }

  return positions
}
