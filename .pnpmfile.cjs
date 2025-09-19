module.exports = {
  hooks: {
    readPackage(pkg) {
      // Фиксим известные проблемы с peer dependencies
      if (pkg.name === 'react-konva') {
        pkg.peerDependencies = {
          ...pkg.peerDependencies,
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        }
      }
      return pkg
    }
  }
}