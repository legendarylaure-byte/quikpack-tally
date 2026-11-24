"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getAuthClient } from "@/lib/firebase";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut(getAuthClient());
        router.replace("/login");
      }}
      className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-info"
    >
      Sign out
    </button>
  );
}
