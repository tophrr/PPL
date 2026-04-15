import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">

      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black sm:items-start">

        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">

          <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
            Dashboard
          </h1>

          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Welcome to your dashboard. You are successfully logged in.
          </p>

        </div>

      </main>

    </div>
  );
}