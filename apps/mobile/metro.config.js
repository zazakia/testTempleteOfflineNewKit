const { getDefaultConfig } = require('@expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, '../..')

const config = getDefaultConfig(__dirname)

// CRITICAL: Force Metro's project root to the mobile app directory
// so relative paths like ../../node_modules resolve correctly
config.projectRoot = projectRoot

// Watch workspace packages for HMR
config.watchFolders = [
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'packages'),
]

// Resolve workspace:* packages
const extraNodeModules = {
  '@repo/core': path.resolve(workspaceRoot, 'packages/core/src'),
  '@repo/entity-customer': path.resolve(workspaceRoot, 'packages/entity-customer/src'),
  '@repo/entity-member': path.resolve(workspaceRoot, 'packages/entity-member/src'),
  '@repo/entity-loan': path.resolve(workspaceRoot, 'packages/entity-loan/src'),
  '@repo/entity-savings': path.resolve(workspaceRoot, 'packages/entity-savings/src'),
  '@repo/entity-share-capital': path.resolve(workspaceRoot, 'packages/entity-share-capital/src'),
  '@repo/entity-accounting': path.resolve(workspaceRoot, 'packages/entity-accounting/src'),
  '@repo/entity-collection': path.resolve(workspaceRoot, 'packages/entity-collection/src'),
  '@repo/entity-governance': path.resolve(workspaceRoot, 'packages/entity-governance/src'),
  '@repo/entity-water-station': path.resolve(workspaceRoot, 'packages/entity-water-station/src'),
  '@repo/entity-laundry': path.resolve(workspaceRoot, 'packages/entity-laundry/src'),
  '@repo/entity-branch': path.resolve(workspaceRoot, 'packages/entity-branch/src'),
  '@repo/multi-tenant': path.resolve(workspaceRoot, 'packages/multi-tenant/src'),
  '@repo/feature-flags': path.resolve(workspaceRoot, 'packages/feature-flags/src'),
  '@repo/audit-trail': path.resolve(workspaceRoot, 'packages/audit-trail/src'),
  '@repo/db-expo-sqlite': path.resolve(workspaceRoot, 'packages/db-adapter-expo-sqlite/src'),
  '@repo/ui-core': path.resolve(workspaceRoot, 'packages/ui-core/src'),
}

config.resolver = {
  ...config.resolver,
  extraNodeModules,
  nodeModulesPaths: [
    path.resolve(workspaceRoot, 'node_modules'),
    path.resolve(__dirname, 'node_modules'),
  ],
  disableHierarchicalLookup: false,
}

module.exports = config
