/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // GitHub Pages를 위한 정적 내보내기 설정
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig
