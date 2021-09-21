const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
})

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

module.exports = withMDX(config)
