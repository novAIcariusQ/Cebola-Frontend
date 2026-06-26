const MAX_DIMENSION = 1600
const TARGET_MAX_BYTES = 900 * 1024
const MIN_QUALITY = 0.5
const INITIAL_QUALITY = 0.85

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    image.src = url
  })
}

function scaledDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height }
  }

  const scale = maxDimension / Math.max(width, height)
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), type, quality)
  })
}

function replaceExtension(filename: string, extension: string) {
  const base = filename.replace(/\.[^.]+$/, '')
  return `${base || 'image'}.${extension}`
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  maxBytes: number,
): Promise<File | null> {
  const outputType = 'image/jpeg'
  let quality = INITIAL_QUALITY

  while (quality >= MIN_QUALITY) {
    const blob = await canvasToBlob(canvas, outputType, quality)
    if (blob && blob.size <= maxBytes) {
      return new File([blob], replaceExtension(filename, 'jpg'), {
        type: outputType,
        lastModified: Date.now(),
      })
    }
    quality -= 0.1
  }

  return null
}

export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  if (file.size <= TARGET_MAX_BYTES) {
    return file
  }

  const image = await loadImage(file)
  let maxDimension = MAX_DIMENSION

  while (maxDimension >= 640) {
    const { width, height } = scaledDimensions(image.naturalWidth, image.naturalHeight, maxDimension)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      return file
    }

    context.drawImage(image, 0, 0, width, height)

    const encoded = await encodeCanvas(canvas, file.name, TARGET_MAX_BYTES)
    if (encoded) {
      return encoded
    }

    maxDimension = Math.round(maxDimension * 0.75)
  }

  return file
}
