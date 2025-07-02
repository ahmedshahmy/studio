import type {NextConfig} from 'next';

// IMPORTANT: Update this to your repository name
const repositoryName = 'nephrosim';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  // Required for static export
  images: {
    unoptimized: true,
  },
  // Add assetPrefix and basePath for GitHub Pages
  basePath: isGithubActions ? `/${repositoryName}` : '',
  assetPrefix: isGithubActions ? `/${repositoryName}/` : '',

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
