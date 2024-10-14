import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub],
  callbacks: {
    async redirect({ redirectTo }) {
      // 获取当前环境的基础 URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // 检查 redirectTo 是否有效
      if (
        redirectTo &&
        redirectTo.startsWith("/") &&
        !redirectTo.includes("://")
      ) {
        return `${baseUrl}${redirectTo}`; // 返回完整 URL
      }
      // 如果 redirectTo 无效或未提供，返回默认路径
      return `${baseUrl}/generate`; // 或者您想要的任何默认路径
    },
  },
});