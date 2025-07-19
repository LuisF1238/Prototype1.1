const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load actual config from config folder
  ...require('./config/next.config.js'),
  
  // Ensure TypeScript config is found
  typescript: {
    tsconfigPath: './config/tsconfig.json'
  },
  
  // Update asset paths
  images: {
    domains: ['localhost'],
  },
  
  // Webpack config to handle moved files
  webpack: (config, { isServer }) => {
    // Add aliases for moved assets
    config.resolve.alias = {
      ...config.resolve.alias,
      '@assets': path.resolve(__dirname, './assets'),
      '@data': path.resolve(__dirname, './data'),
      '@config': path.resolve(__dirname, './config'),
      '@src': path.resolve(__dirname, './src'),
    }
    
    // Handle puppeteer and other external packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
      }
    }
    
    return config
  },
}

module.exports = nextConfig