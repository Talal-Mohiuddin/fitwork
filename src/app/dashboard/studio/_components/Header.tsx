import React from 'react';

export default function Header() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl md:text-4xl font-black text-text-main dark:text-white tracking-tight">
        Good Morning, Equinox
      </h1>
      <p className="text-text-sub dark:text-gray-400 text-base">
        Here's the latest status of your Hudson Yards studio operations.
      </p>
    </div>
  );
}
