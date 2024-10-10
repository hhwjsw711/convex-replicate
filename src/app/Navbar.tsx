"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignIn } from "../SignIn";
import { SignOut } from "../SignOut";

export function Navbar() {
  return (
    <div className="border-b py-4">
      <div className="container mx-auto flex justify-between">
        <div>LOGO</div>
        <nav className="flex gap-4">
          <Unauthenticated>
            <Link href="/">Dashboard</Link>
            <Link href="/collection">Collection</Link>
          </Unauthenticated>
          <Authenticated>
            <Link href="/generate/guided">Guided</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/videos">Videos</Link>
          </Authenticated>
        </nav>
        <AuthLoading>
          <div>Loading...</div>
        </AuthLoading>
        <Unauthenticated>
          <SignIn />
        </Unauthenticated>
        <Authenticated>
          <SignOut />
        </Authenticated>
      </div>
    </div>
  );
}
