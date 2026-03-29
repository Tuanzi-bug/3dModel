import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@3d-modeler/core',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing',
    'three',
  ],
}

export default nextConfig
