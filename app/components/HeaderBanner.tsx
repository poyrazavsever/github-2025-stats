import Image from "next/image";

export function HeaderBanner() {
  return (
    <header className="flex items-end justify-center gap-4 pt-6">
      <Image
        src="/logo.png"
        alt="App logo"
        width={64}
        height={64}
        className="h-16 w-16 object-contain"
        priority
      />
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-neutral-800">
          Welcome 2026
        </span>
        <span className="text-sm text-neutral-600">
          Let's explore the year together!
        </span>
      </div>
    </header>
  );
}
