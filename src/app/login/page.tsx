"use client";

import LoginForm from "./_components/login-form";

const Login = () => {
  return (
    <div className="min-h-screen flex max-w-7xl mx-auto">
      <main className="flex-grow flex items-center">
        {/* Left Column - Placeholder for Carousel */}
        <div className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3nLlEhz8m0pTtKAD8dxTcjAjH9I0NNTsok7y37aDU6Y9zVFVDSl23d2uZhtRAWqzxDX8nPkOwrQqqGS7n6GtTLWYIVGDYWzcEYhQ-2wZudm1jsV69Z1E_IfV3JNAEsB8sNIGi9NcmwyRnekzijQHIR4rVqwRDmbq6RiZ-KwGMsDZ3KnoKTZNBZlaUS3VIMmAc2UzpDqRLWVsWShUsbM_j_yY2KcDdKJ4A9pYRpox5--qUFfXbvLAhM8gRhTJJRo_iXLqbnfWTj40"
            alt="Login background"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto pb-4 sm:pb-0">
          <LoginForm />
        </div>
      </main>
    </div>
  );
};

export default Login;
