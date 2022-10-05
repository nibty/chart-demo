/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  publicRuntimeConfig: {
    baseApiUrl: process.env.NEXT_PUBLIC_BASE_API_URL || 'https://api.xen.network'
  }
}

module.exports = nextConfig
