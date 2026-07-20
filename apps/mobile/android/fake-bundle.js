// Fake bundle script for Gradle — copies pre-built bundle from expo export
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
let entryFile, bundleOutput, sourcemapOutput, assetsDest, platform

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--entry-file' && args[i+1]) entryFile = args[i+1]
  if (args[i] === '--bundle-output' && args[i+1]) bundleOutput = args[i+1]
  if (args[i] === '--sourcemap-output' && args[i+1]) sourcemapOutput = args[i+1]
  if (args[i] === '--assets-dest' && args[i+1]) assetsDest = args[i+1]
  if (args[i] === '--platform' && args[i+1]) platform = args[i+1]
}

const mobileDir = path.resolve(__dirname, '..')
const exportDir = path.join(mobileDir, 'android', 'app', 'src', 'main', 'assets', '_expo', 'static', 'js', 'android')
const hbcFiles = fs.readdirSync(exportDir).filter(f => f.endsWith('.hbc'))

if (hbcFiles.length === 0) {
  console.error('No pre-built bundle found. Run: npx expo export --platform android')
  process.exit(1)
}

const bundleFile = path.join(exportDir, hbcFiles[0])
console.log(`Using pre-built bundle: ${bundleFile}`)

// Copy bundle
if (bundleOutput) {
  fs.mkdirSync(path.dirname(bundleOutput), { recursive: true })
  fs.copyFileSync(bundleFile, bundleOutput)
  console.log(`Copied bundle to: ${bundleOutput}`)
}

// Create sourcemap
if (sourcemapOutput) {
  fs.mkdirSync(path.dirname(sourcemapOutput), { recursive: true })
  fs.writeFileSync(sourcemapOutput, '{"version":3,"sources":[],"mappings":""}')
  console.log(`Created sourcemap at: ${sourcemapOutput}`)
}

// Copy assets
if (assetsDest) {
  const assetDir = path.join(mobileDir, 'android', 'app', 'src', 'main', 'assets')
  fs.mkdirSync(assetsDest, { recursive: true })
  console.log(`Assets dir: ${assetsDest}`)
}

console.log('Bundle injection complete.')
