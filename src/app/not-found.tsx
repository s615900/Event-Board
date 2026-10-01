import Link from 'next/link';
import { CircleHelp } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f4efe5] px-5 text-[#213746]">
      <div className="w-full max-w-md rounded-2xl border border-[#d9cfc1] bg-[#f8f4ec] p-8 text-center shadow-sm">
        <CircleHelp size={32} className="mx-auto text-[#ed7659]" />
        <p className="mt-5 font-mono-custom text-[11px] tracking-[.2em] text-[#ed7659]">ERROR / 404</p>
        <h1 className="mt-2 font-display text-5xl font-bold text-[#17364a]">找不到這個頁面</h1>
        <p className="mt-3 text-sm text-[#718083]">網址可能打錯了，或頁面已經移除。</p>
        <Link href="/" className="mt-7 inline-flex rounded-lg bg-[#ed7659] px-5 py-3 text-sm font-bold text-white hover:bg-[#d95e49]">回到首頁</Link>
      </div>
    </div>
  );
}
