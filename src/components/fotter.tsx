export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-light dark:bg-slate-950 pt-16 pb-8 border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 md:px-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6  text-[#21c55e]">
                <svg
                  className="w-full h-full"
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <span className="font-bold text-neutral-dark text-lg">
                Fitgig
              </span>
            </div>
          </div>

          {/* General Section */}
          <div>
            <h4 className="font-semibold text-neutral-dark mb-4 text-sm">
              General
            </h4>
            <ul className="space-y-2 text-sm text-neutral-mid">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Sign Up
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Help Center
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  About
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Press
                </a>
              </li>
            </ul>
          </div>

          {/* Browse Fitgig Section */}
          <div>
            <h4 className="font-semibold text-neutral-dark mb-4 text-sm">
              Browse Fitgig
            </h4>
            <ul className="space-y-2 text-sm text-neutral-mid">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Jobs
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Instructors
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Studios
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Salary
                </a>
              </li>
            </ul>
          </div>

          {/* Business Solutions Section */}
          <div>
            <h4 className="font-semibold text-neutral-dark mb-4 text-sm">
              Business Solutions
            </h4>
            <ul className="space-y-2 text-sm text-neutral-mid">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Talent Solutions
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Marketing
                </a>
              </li>
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  Sales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border-light flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-mid">
          <div className="flex gap-4">
            <span>© {currentYear} Fitgig Inc.</span>
            <a className="hover:text-neutral-dark" href="#">
              Accessibility
            </a>
            <a className="hover:text-neutral-dark" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-neutral-dark" href="#">
              Cookie Policy
            </a>
          </div>
          <div>
            <span className="font-semibold text-neutral-dark">
              Fitgig Corporation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
