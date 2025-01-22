export function Navbar() {
    return (
        <nav className="navbar bg-base-300 sticky top-0">
            <div className="navbar-start">
                <details className="dropdown">
                    <summary className="btn btn-ghost btn-circle">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <title>Menu</title>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                    </summary>
                    <ul
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-sm">
                        <li><a href="/">Home</a></li>
                        <li><a href="/">Portfolio</a></li>
                        <li><a href="/">About</a></li>
                    </ul>
                </details>
            </div>
            <div className="navbar-center">
                <a href="/" className="btn btn-ghost text-xl">Phoenyx</a>
            </div>
            <div className="navbar-end">
                <button type="button" className="btn btn-ghost btn-circle">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <title>Search</title>
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>

            </div>
        </nav>
    )
}