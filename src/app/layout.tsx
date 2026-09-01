import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "CyberGuard | Security Awareness Training",
  description: "Interactive cybersecurity training for individuals and teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font Awesome CDN */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Dark Mode Prevention Script */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            })();
          `
        }} />
      </head>
      
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900 dark:bg-slate-900 dark:text-white">
        
        {/* Public Navbar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-800 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                <i className="fas fa-shield-halved"></i>
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight">CyberGuard</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Sign In</Link>
              <Link href="/register" className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 min-h-[80vh]">{children}</main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <i className="fas fa-shield-halved text-blue-400 text-xl"></i>
                <span className="text-lg font-bold">CyberGuard</span>
              </div>
              <p className="text-slate-400 text-sm">Securing the human layer of your organization through interactive training.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Contact Us</h4>
              <p className="text-slate-400 text-sm mb-2"><i className="fas fa-envelope mr-2"></i> support@cyberguard.com</p>
              <p className="text-slate-400 text-sm mb-2"><i className="fas fa-phone mr-2"></i> +1 (555) 123-4567</p>
              <p className="text-slate-400 text-sm"><i className="fas fa-map-marker-alt mr-2"></i> 123 Security Plaza, Tech City</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <Link href="/" className="block text-slate-400 text-sm mb-2 hover:text-white">Home</Link>
              <Link href="/login" className="block text-slate-400 text-sm mb-2 hover:text-white">Sign In</Link>
              <Link href="/register" className="block text-slate-400 text-sm hover:text-white">Create Account</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 py-4 text-center text-slate-500 text-sm">
            <p>© 2024 CyberGuard. All rights reserved.</p>
          </div>
        </footer>
        
      </body>
    </html>
  );
}