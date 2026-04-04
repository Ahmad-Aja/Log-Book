import ar from '@/dictionaries/ar.json' assert { type: 'json' }
import en from '@/dictionaries/en.json' assert { type: 'json' }

let hasErrors = false

function deepCompare(arObj: any, enObj: any, path: string = '') {
  const allKeys = new Set([...Object.keys(arObj || {}), ...Object.keys(enObj || {})])

  for (const key of allKeys) {
    const arVal = arObj?.[key]
    const enVal = enObj?.[key]
    const currentPath = path ? `${path}.${key}` : key

    if (!(key in arObj)) {
      console.error(`🟥 Missing in AR lang file: ${currentPath}`)
      hasErrors = true
    } else if (!(key in enObj)) {
      console.error(`🟥 Missing in EN lang file: ${currentPath}`)
      hasErrors = true
    } else {
      const arType = getType(arVal)
      const enType = getType(enVal)

      if (arType !== enType) {
        console.error(`⚠️ Type mismatch at ${currentPath}: AR is ${arType}, EN is ${enType}`)
        hasErrors = true
      } else if (arType === 'object') {
        deepCompare(arVal, enVal, currentPath)
      } else if (arType === 'array') {
        if (arVal.length !== enVal.length) {
          console.error(`📏 Length mismatch at ${currentPath}: AR(${arVal.length}) vs EN(${enVal.length})`)
          hasErrors = true
        }
        arVal.forEach((item: any, index: number) => {
          if (typeof item === 'object' && typeof enVal[index] === 'object') {
            deepCompare(item, enVal[index], `${currentPath}[${index}]`)
          }
        })
      }
    }
  }
}

function getType(value: any): string {
  if (Array.isArray(value)) return 'array'
  if (value === null) return 'null'
  return typeof value
}

deepCompare(ar, en)

if (hasErrors) {
  console.error('❌ Translation check failed. Build aborted.')
  process.exit(1) // exit with error code to stop build
} else {
  console.log('✅ Translation check passed successfully.')
}
