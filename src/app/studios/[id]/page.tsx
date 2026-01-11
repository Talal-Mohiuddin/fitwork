"use client";

import { useParams } from "next/navigation";

export default function StudioDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Studio Details</h1>
      <p>Studio ID: {id}</p>
      <p>This page is under development. The studio detail functionality will be implemented with Firebase integration.</p>
    </div>
  );
}
