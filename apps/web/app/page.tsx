"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetUserInfo } from "~/hooks/api/auth";

export default function Home() {
  const { user } = useGetUserInfo();
  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user]);

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h2>{JSON.stringify(user, null, 2)}</h2>
      </div>
    </main>
  );
}
