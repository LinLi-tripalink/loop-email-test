/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保环境变量在客户端可用
  env: {
    NEXT_PUBLIC_CLAUDE_API_KEY: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    NEXT_PUBLIC_VOLCENGINE_ACCESS_KEY_ID:
      process.env.NEXT_PUBLIC_VOLCENGINE_ACCESS_KEY_ID,
    NEXT_PUBLIC_VOLCENGINE_SECRET_KEY:
      process.env.NEXT_PUBLIC_VOLCENGINE_SECRET_KEY,
  },

  // 允许外部域名的图片
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p9-aiop-sign.byteimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.volcengineapi.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
