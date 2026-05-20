import { api } from "~/trpc/server";

export default async function Home() {

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h2>Server Message: {"message"}</h2>
      </div>
    </main>
  );
}
