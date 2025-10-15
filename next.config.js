/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable export mode for development to fix static file issues
  // output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  experimental: {
    typedRoutes: true
  }
}

module.exports = nextConfig