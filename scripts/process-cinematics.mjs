import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const knightVideo = path.join(rootDir, 'src/assets/cinematics/knight video/knight video.mp4')
const samuraiVideo = path.join(rootDir, 'src/assets/cinematics/samurai video/samurai video.mp4')

const knightPngDir = path.join(rootDir, 'src/assets/cinematics/knight')
const samuraiPngDir = path.join(rootDir, 'src/assets/cinematics/samurai')

const knightAvifDir = path.join(rootDir, 'public/cinematics/knight')
const samuraiAvifDir = path.join(rootDir, 'public/cinematics/samurai')

const stagingDir = path.join(rootDir, 'test-results/staging')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function safeUnlink(file) {
  // Retry briefly in case an editor/dev-server holds the file open (EBUSY on Windows).
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      fs.unlinkSync(file)
      return
    } catch (err) {
      if (err.code !== 'EBUSY' || attempt === 9) throw err
      console.warn(`  File locked, retrying in 300ms: ${file}`)
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 300)
    }
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
    for (const f of files) {
      if (f.endsWith('.png') || f.endsWith('.avif')) {
        safeUnlink(path.join(dir, f))
      }
    }
  } else {
    fs.mkdirSync(dir, { recursive: true })
  }
}

console.log('=== STAGE 1: Inspecting Videos ===')
console.log(`Knight video: ${knightVideo}`)
console.log(`Samurai video: ${samuraiVideo}`)

if (!fs.existsSync(knightVideo) || !fs.existsSync(samuraiVideo)) {
  console.error('Error: Original videos not found!')
  process.exit(1)
}

ensureDir(stagingDir)

const knightStage = path.join(stagingDir, 'knight')
const samuraiStage = path.join(stagingDir, 'samurai')
ensureDir(knightStage)
ensureDir(samuraiStage)

console.log('\n=== STAGE 2: Extracting Frames at 24 FPS ===')

// Clean staging
cleanDir(knightStage)
cleanDir(samuraiStage)

console.log('Extracting Knight frames...')
execSync(`ffmpeg -y -i "${knightVideo}" -vf "fps=24" "${path.join(knightStage, 'frame_%03d.png')}"`, { stdio: 'inherit' })

console.log('Extracting Samurai frames...')
execSync(`ffmpeg -y -i "${samuraiVideo}" -vf "fps=24" "${path.join(samuraiStage, 'frame_%03d.png')}"`, { stdio: 'inherit' })

const knightFrames = fs.readdirSync(knightStage).filter(f => f.endsWith('.png')).sort()
const samuraiFrames = fs.readdirSync(samuraiStage).filter(f => f.endsWith('.png')).sort()

console.log(`Extracted Knight frames: ${knightFrames.length}`)
console.log(`Extracted Samurai frames: ${samuraiFrames.length}`)

if (knightFrames.length === 0 || samuraiFrames.length === 0) {
  console.error('Error: Frame extraction failed!')
  process.exit(1)
}

// Replace source PNG sequences cleanly
console.log('\nReplacing source PNG sequences...')
cleanDir(knightPngDir)
cleanDir(samuraiPngDir)

for (const file of knightFrames) {
  fs.copyFileSync(path.join(knightStage, file), path.join(knightPngDir, file))
}
for (const file of samuraiFrames) {
  fs.copyFileSync(path.join(samuraiStage, file), path.join(samuraiPngDir, file))
}

console.log('✓ Source PNG sequences replaced successfully.')

console.log('\n=== STAGE 3: Generating Optimized AVIF Derivatives (1920x1080) ===')
ensureDir(knightAvifDir)
ensureDir(samuraiAvifDir)
cleanDir(knightAvifDir)
cleanDir(samuraiAvifDir)

console.log('Encoding Knight AVIFs...')
for (let i = 0; i < knightFrames.length; i++) {
  const srcPng = path.join(knightPngDir, knightFrames[i])
  const destAvif = path.join(knightAvifDir, `frame_${(i + 1).toString().padStart(3, '0')}.avif`)
  execSync(`ffmpeg -y -i "${srcPng}" -vf "scale=1920:1080:flags=lanczos" -c:v libaom-av1 -cpu-used 4 -crf 30 -b:v 0 -still-picture 1 "${destAvif}"`, { stdio: 'ignore' })
  if ((i + 1) % 20 === 0 || i === knightFrames.length - 1) {
    console.log(`  Encoded Knight frame ${i + 1}/${knightFrames.length}`)
  }
}

console.log('Encoding Samurai AVIFs...')
for (let i = 0; i < samuraiFrames.length; i++) {
  const srcPng = path.join(samuraiPngDir, samuraiFrames[i])
  const destAvif = path.join(samuraiAvifDir, `frame_${(i + 1).toString().padStart(3, '0')}.avif`)
  execSync(`ffmpeg -y -i "${srcPng}" -vf "scale=1920:1080:flags=lanczos" -c:v libaom-av1 -cpu-used 4 -crf 30 -b:v 0 -still-picture 1 "${destAvif}"`, { stdio: 'ignore' })
  if ((i + 1) % 20 === 0 || i === samuraiFrames.length - 1) {
    console.log(`  Encoded Samurai frame ${i + 1}/${samuraiFrames.length}`)
  }
}

console.log('✓ All AVIF derivatives generated and validated successfully.')

// Check final counts
const finalKnightAvifs = fs.readdirSync(knightAvifDir).filter(f => f.endsWith('.avif'))
const finalSamuraiAvifs = fs.readdirSync(samuraiAvifDir).filter(f => f.endsWith('.avif'))

console.log(`\nFinal Summary:`)
console.log(`- Knight: ${finalKnightAvifs.length} AVIF frames`)
console.log(`- Samurai: ${finalSamuraiAvifs.length} AVIF frames`)
console.log('=== PROCESS COMPLETE ===')
