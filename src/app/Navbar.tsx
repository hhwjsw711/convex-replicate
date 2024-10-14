"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignIn } from "../SignIn";
import { SignOut } from "../SignOut";

export function Navbar() {
  return (
    <div className="border-b py-4">
      <div className="container mx-auto flex justify-between">
        <Unauthenticated>
          <Link href="/">LOGO</Link>
        </Unauthenticated>
        <Authenticated>
          <div>LOGO</div>
        </Authenticated>
        <nav className="flex gap-4">
          <Unauthenticated>
            <Link href="/collection">Collection</Link>
          </Unauthenticated>
          <Authenticated>
            <Link href="/generate">Make a Video</Link>
            <Link href="/stories">Your Stories</Link>
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
