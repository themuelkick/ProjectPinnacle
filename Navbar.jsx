import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  // Primary navigation (Left side)
  const mainLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Encyclopedia", path: "/encyclopedia" },
  ];

  // Action links (Right side)
  const actionLinks = [
    { name: "New Player", path: "/players/new" },
    { name: "New Drill", path: "/drills/new" },
    { name: "New Concept", path: "/encyclopedia/new" },
  ];

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md text-white shadow-xl sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left Side: Logo and Main Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-black tracking-tighter flex items-center gap-2 group">
            <span className="text-blue-500 font-extrabold tracking-widest text-xs italic uppercase hidden lg:block">Pinnacle</span>
            <span className="bg-blue-600 px-2 py-1 rounded">PDS</span>
            <span className="hidden sm:inline">PLAYER DEV SYSTEM</span>
          </Link>

          <div className="flex gap-1">
            {mainLinks.map((link) => {
              const isActive = link.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side: Action Options */}
        <div className="flex gap-1">
          {actionLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

      </div>
    </nav>
  );
}