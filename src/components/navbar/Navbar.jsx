import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // Primary navigation (Left side)
  const mainLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Encyclopedia", path: "/encyclopedia" },
  ];

  // Action links (Right side) - Only show if user is logged in
  const actionLinks = [
    { name: "New Player", path: "/players/new" },
    { name: "New Drill", path: "/drills/new" },
    { name: "New Concept", path: "/encyclopedia/new" },
  ];

  const handleLogout = async () => {
  try {
    console.log("Attempting logout...");
    await signOut();
    console.log("Logout successful, forcing redirect...");

    // Use this to hard-reset the app state
    window.location.href = '/login';
  } catch (error) {
    console.error("Logout failed:", error);
    window.location.href = '/login';
  }
};

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

          {user && (
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
          )}
        </div>

        {/* Right Side: Identity & Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Desktop Action Links */}
              <div className="hidden md:flex gap-1 border-r border-white/10 pr-4">
                {actionLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                      location.pathname === link.path
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* User Identity Info */}
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white leading-none uppercase">
                    {profile?.email?.split('@')[0] || 'User'}
                  </p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${
                    profile?.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                    profile?.role === 'pro' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {profile?.role || 'Coach'}
                  </span>
                </div>

                {/* Logout Button - Enhanced with type and pointer safety */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20 relative z-10"
                  title="Terminate Session"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}