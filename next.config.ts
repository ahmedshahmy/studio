import type {NextConfig} from 'next';

const repositoryName = 'nephrosim';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd && repositoryName ? `/${repositoryName}` : '',
  assetPrefix: isProd && repositoryName ? `/${repositoryName}/` : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
