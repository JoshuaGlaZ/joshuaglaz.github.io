import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "",
  assetPrefix: "",
  trailingSlash: true,
	pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
	experimental: {
		mdxRs: true,
	},
  images: {
    unoptimized: true,
  },
  generateBuildId: async () => {
    return 'static-build'
  },
};

export default withContentlayer(nextConfig);
