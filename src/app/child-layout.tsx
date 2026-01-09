"use client";

import Footer from "@/components/fotter";
import Header from "@/components/Header";
import { queryClient } from "@/lib/tanstack";
import { AuthProvider } from "@/store/firebase-auth-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

export default function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
