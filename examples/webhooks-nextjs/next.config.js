/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  serverRuntimeConfig: {
    livekitApiKey: 'testkey',
    livekitApiSecret: 'this-is-a-very-long-test-secret-with-at-least-32-characters',
  },
};

module.exports = nextConfig;
