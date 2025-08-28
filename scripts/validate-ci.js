#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * CI/CD Validation Script
 *
 * This script validates that all CI/CD components are properly configured
 * and can be executed locally before pushing to GitHub.
 */

const { execSync } = require('child_process')
const fs = require('node:fs')
const path = require('node:path')

const REQUIRED_FILES = [
  '.github/workflows/ci.yml',
  '.github/workflows/security.yml',
  '.github/workflows/test-ci.yml',
  '.github/dependabot.yml',
  '.releaserc.json',
  '.husky/pre-commit',
  '.husky/pre-push',
]

const REQUIRED_SCRIPTS = [
  'validate',
  'ci',
  'build:prod',
  'package',
  'publish:vscode',
  'publish:openvsx',
  'security:audit',
  'security:check',
]

const REQUIRED_DEPENDENCIES = [
  'semantic-release',
  '@semantic-release/changelog',
  '@semantic-release/git',
  '@semantic-release/github',
  '@semantic-release/npm',
  '@semantic-release/exec',
  '@vscode/vsce',
  'ovsx',
  'audit-ci',
]

function checkFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required file missing: ${filePath}`)
  }
  console.log(`✅ ${filePath}`)
}

function checkScript(scriptName) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    throw new Error(`Required script missing: ${scriptName}`)
  }
  console.log(`✅ Script: ${scriptName}`)
}

function checkDependency(depName) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }

  if (!allDeps[depName]) {
    throw new Error(`Required dependency missing: ${depName}`)
  }
  console.log(`✅ Dependency: ${depName}`)
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`)
  try {
    execSync(command, { stdio: 'pipe' })
    console.log(`✅ ${description}`)
  } catch (error) {
    console.error(`❌ ${description} failed:`)
    console.error(error.stdout?.toString() || error.message)
    throw error
  }
}

async function main() {
  console.log('🚀 Validating CI/CD Setup...\n')

  try {
    // Check required files
    console.log('📁 Checking required files...')
    REQUIRED_FILES.forEach(checkFile)

    // Check required scripts
    console.log('\n📜 Checking required scripts...')
    REQUIRED_SCRIPTS.forEach(checkScript)

    // Check required dependencies
    console.log('\n📦 Checking required dependencies...')
    REQUIRED_DEPENDENCIES.forEach(checkDependency)

    // Test critical commands
    console.log('\n🧪 Testing critical commands...')
    runCommand('npm run type-check', 'TypeScript type checking')
    runCommand('npm run lint', 'ESLint validation')
    runCommand('npm run format:check', 'Prettier format checking')
    runCommand('npm run build:prod', 'Production build')
    runCommand('npm run package', 'Extension packaging')

    // Validate workflow files
    console.log('\n🔍 Validating workflow files...')
    const ciWorkflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8')

    // Check for required secrets in CI workflow
    const requiredSecrets = ['VSCE_PAT', 'OVSX_PAT']
    const missingSecrets = requiredSecrets.filter((secret) => !ciWorkflow.includes(secret))

    if (missingSecrets.length > 0) {
      throw new Error(`CI workflow missing required secrets: ${missingSecrets.join(', ')}`)
    }
    console.log('✅ CI workflow configuration')

    // Validate release workflow if it exists
    const releaseWorkflowPath = '.github/workflows/release.yml'
    if (fs.existsSync(releaseWorkflowPath)) {
      const releaseWorkflow = fs.readFileSync(releaseWorkflowPath, 'utf8')
      const releaseMissingSecrets = requiredSecrets.filter((secret) => !releaseWorkflow.includes(secret))

      if (releaseMissingSecrets.length > 0) {
        throw new Error(`Release workflow missing required secrets: ${releaseMissingSecrets.join(', ')}`)
      }
      console.log('✅ Release workflow configuration')
    }

    const releaseConfig = fs.readFileSync('.releaserc.json', 'utf8')
    JSON.parse(releaseConfig) // Validate JSON syntax
    console.log('✅ Semantic release configuration')

    console.log('\n🎉 CI/CD validation completed successfully!')
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }
