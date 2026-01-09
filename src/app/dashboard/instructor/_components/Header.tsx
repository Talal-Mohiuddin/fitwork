import React from 'react';

export default function Header() {
  return (
    <header className="flex flex-col gap-2 pt-2">
      <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
        Good morning, Sarah
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
        You have 2 classes scheduled today. Let's make it count.
      </p>
    </header>
  );
}
