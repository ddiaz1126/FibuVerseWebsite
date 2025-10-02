import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['fibu-media.s3.amazonaws.com'],
  },
};

module.exports = nextConfig;
