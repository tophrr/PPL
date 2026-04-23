import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md bg-white dark:bg-black p-8 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center text-black dark:text-zinc-50">
          Login
        </h1>

        <form className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="border p-2 rounded" />

          <input type="password" placeholder="Password" className="border p-2 rounded" />

          <button type="submit" className="bg-black text-white py-2 rounded">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
