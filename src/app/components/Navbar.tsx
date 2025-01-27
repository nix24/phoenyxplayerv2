import { Menu } from "lucide-react";

export function Navbar() {
	return (
		<div className="drawer z-50">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content">
				{/* Navbar have it stay on top of viewport when scrolling */}
				<nav className="navbar bg-base-300 sticky top-0 ">
					<div className="navbar-start">
						{/* Drawer Toggle Button */}
						<label
							htmlFor="my-drawer"
							className="btn btn-ghost btn-circle transition-transform duration-300 ease-in-out hover:scale-110 active:scale-95"
						>
							<Menu />
						</label>
					</div>
					<div className="navbar-center">
						<a href="/" className="btn btn-ghost text-xl">
							Phoenyx
						</a>
					</div>
					<div className="navbar-end">
						{/* Search Button */}
						<button type="button" className="btn btn-ghost btn-circle">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Search</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</div>
				</nav>
			</div>

			{/* Drawer Side */}
			<div className="drawer-side">
				<label
					htmlFor="my-drawer"
					aria-label="close sidebar"
					className="drawer-overlay"
				/>
				<ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
					{/* Drawer Links */}
					<li>
						<a href="/">Home</a>
					</li>
					<li>
						<a href="/playlists">Playlists</a>
					</li>
					<li>
						<details>
							<summary>Conversion</summary>
							<ul>
								<li>
									<a href="/conversion/mp3">MP3 Conversion</a>
								</li>
								<li>
									<a href="/conversion/compression">MP3 Compression</a>
								</li>
							</ul>
						</details>
					</li>
					<li>
						<a href="/about">About</a>
					</li>
				</ul>
			</div>
		</div>
	);
}
