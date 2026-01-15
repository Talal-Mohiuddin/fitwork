"use client";

import { Suspense } from "react";
import LoginForm from "./_components/login-form";
import { Star } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right Column - Side Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-100 dark:bg-slate-900">
        <img
          alt="Minimalist bright yoga studio space with wooden floor"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3nLlEhz8m0pTtKAD8dxTcjAjH9I0NNTsok7y37aDU6Y9zVFVDSl23d2uZhtRAWqzxDX8nPkOwrQqqGS7n6GtTLWYIVGDYWzcEYhQ-2wZudm1jsV69Z1E_IfV3JNAEsB8sNIGi9NcmwyRnekzijQHIR4rVqwRDmbq6RiZ-KwGMsDZ3KnoKTZNBZlaUS3VIMmAc2UzpDqRLWVsWShUsbM_j_yY2KcDdKJ4A9pYRpox5--qUFfXbvLAhM8gRhTJJRo_iXLqbnfWTj40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 lg:p-16 text-white">
          <div className="max-w-md">
            <div className="mb-6 flex gap-1 text-green-400">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
            </div>
            <blockquote className="text-2xl lg:text-3xl font-medium leading-tight tracking-tight mb-6 drop-shadow-sm">
              "The Talent OS for the modern fitness world. Simple, fast, and reliable."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/30">
                <img
                  alt="Profile picture of Elena"
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkLoPj3E1Bx14q_mXy6yLeMVyrjz2lTE3gHNawI-yBSjGJEZiSJJ8HQHLKlt88AFsYQYtEus-Jya_py6c7hE5Gqj7dVsINFUU_Z4_cCoHHAnYA20vPc0gVf3vdGPIy85MQr9aTzNc3fm9VkzPGKnqd9R61b6hCbCPLgP5Pc9Fz5sgx8YeV5R8-EJgSqP9ddfEEUoWh3ksgGIXv9G4GvYLvPUS6XnBjTPKLAHLhu-_9k52R0i5QoD49WOhoXsdSt50wXlFh4g4c99o"
                />
              </div>
              <div>
                <p className="font-semibold text-white">Elena S.</p>
                <p className="text-sm text-white/80">
                  Pilates Instructor, Stockholm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
