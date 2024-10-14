import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from 'next/navigation';

export function SignOut() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // 获取当前环境的基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // 使用 router.push 进行客户端导航
    router.push(baseUrl);
  };

  return <button onClick={handleSignOut}>Sign out</button>;
}