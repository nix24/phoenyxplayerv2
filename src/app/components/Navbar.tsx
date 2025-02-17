import {
	Menu,
	Home,
	Music2,
	Disc3,
	Radio,
	Info,
	Search,
	Heart,
	GitBranchIcon,
} from "lucide-react";
import Link from "next/link";

export function Navbar() {
	return (
		<div className="drawer z-50">
			<input id="my-drawer" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content">
				<nav
					className="navbar backdrop-blur-xl bg-gradient-to-r from-base-300/80 
        via-primary/5 to-base-300/80 sticky top-0 border-b border-white/10 
        shadow-lg shadow-primary/5"
				>
					<div className="navbar-start">
						<label
							htmlFor="my-drawer"
							className="btn btn-ghost btn-circle relative group overflow-hidden"
						>
							<div
								className="absolute inset-0 bg-gradient-to-br from-primary/20 
              to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity 
              duration-300"
							/>
							<Menu
								className="w-6 h-6 group-hover:scale-110 transition-transform 
              duration-300"
							/>
						</label>
					</div>

					<div className="navbar-center">
						<Link
							href="/"
							className="relative group px-4 py-2 font-bold text-2xl tracking-wider"
						>
							<span
								className="relative z-10 bg-gradient-to-r from-primary 
              to-secondary bg-clip-text text-transparent"
							>
								Phoenyx
							</span>
							<div
								className="absolute inset-0 bg-gradient-to-r from-primary/20 
              to-secondary/20 scale-x-0 group-hover:scale-x-100 transition-transform 
              duration-500 rounded-lg"
							/>
							<div
								className="absolute bottom-0 left-0 w-full h-[2px] 
              bg-gradient-to-r from-primary to-secondary scale-x-0 
              group-hover:scale-x-100 transition-transform duration-500"
							/>
						</Link>
					</div>

					<div className="navbar-end">
						<button
							type="button"
							className="btn btn-ghost btn-circle relative group overflow-hidden"
						>
							<div
								className="absolute inset-0 bg-gradient-to-br from-primary/20 
              to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity 
              duration-300"
							/>
							<Search
								className="w-6 h-6 group-hover:scale-110 transition-transform 
              duration-300"
							/>
						</button>
					</div>
				</nav>
			</div>

			{/* Drawer */}
			<div className="drawer-side">
				<label htmlFor="my-drawer" className="drawer-overlay" />
				<div
					className="menu p-4 w-80 min-h-full bg-gradient-to-b from-base-300/95 
        to-base-200/95 backdrop-blur-2xl border-r border-white/10 relative 
        overflow-hidden"
				>
					{/* Animated background elements */}
					<div className="absolute inset-0 overflow-hidden">
						<div
							className="absolute top-0 left-0 w-64 h-64 bg-primary/10 
            rounded-full filter blur-3xl animate-pulse"
						/>
						<div
							className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/10 
            rounded-full filter blur-3xl animate-pulse delay-1000"
						/>
					</div>

					{/* Logo Section */}
					<div className="relative z-10 px-4 py-6 border-b border-white/10">
						<h2
							className="text-3xl font-bold bg-gradient-to-r from-primary 
            to-secondary bg-clip-text text-transparent"
						>
							Phoenyx
						</h2>
						<p className="text-sm text-white/60">Music Player</p>
					</div>

					{/* Menu Items */}
					<ul className="menu menu-lg gap-2 mt-6 relative z-10">
						<MenuLink href="/" icon={<Home />} text="Home" />
						<MenuLink href="/playlists" icon={<Disc3 />} text="Playlists" />

						<li>
							<details className="group">
								<summary
									className="flex items-center gap-4 hover:bg-white/5 
                active:bg-white/10 transition-all duration-300 rounded-xl 
                group-open:bg-white/5"
								>
									<div className="w-5 h-5 flex items-center justify-center">
										<Radio
											className="w-4 h-4 group-open:text-primary 
                    transition-colors"
										/>
									</div>
									<span
										className="font-medium group-open:text-primary 
                  transition-colors"
									>
										Conversion
									</span>
								</summary>
								<ul className="menu menu-sm pl-6 mt-2">
									<SubMenuLink href="/conversion/" text="Audio Conversion" />
									<SubMenuLink
										href="/conversion/youtube"
										text="YouTube to MP3"
									/>
								</ul>
							</details>
						</li>

						<MenuLink href="/about" icon={<Info />} text="About" />
					</ul>

					{/* Footer */}
					<div className="mt-auto pt-6 border-t border-white/10 relative z-10">
						<div className="text-center space-y-2">
							<Music2 className="w-6 h-6 mx-auto text-primary animate-pulse" />
							<p className="text-sm text-white/60">
								Made by{" "}
								<a
									href="https://github.com/nix24"
									target="_blank"
									rel="noopener noreferrer"
									className="hover:border-b transition-colors"
								>
									<span className="inline-block text-primary">Nix24</span>
								</a>
								<br />
								{`\u00A9 ${new Date().getFullYear()}`} All rights reserved.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function MenuLink({
	href,
	icon,
	text,
}: Readonly<{ href: string; icon: React.ReactNode; text: string }>) {
	return (
		<li>
			<Link
				href={href}
				className="group flex items-center gap-4 hover:bg-white/5 active:bg-white/10 
        transition-all duration-300 rounded-xl relative overflow-hidden"
			>
				<div className="w-5 h-5 flex items-center justify-center">{icon}</div>
				<span className="font-medium">{text}</span>
				<div
					className="absolute inset-0 bg-gradient-to-r from-primary/10 
        to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity 
        duration-300"
				/>
			</Link>
		</li>
	);
}

function SubMenuLink({ href, text }: Readonly<{ href: string; text: string }>) {
	return (
		<li>
			<Link
				href={href}
				className="group hover:bg-white/5 active:bg-white/10 transition-all 
        duration-300 rounded-xl relative overflow-hidden"
			>
				<span className="font-medium">{text}</span>
				<div
					className="absolute inset-0 bg-gradient-to-r from-primary/10 
        to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity 
        duration-300"
				/>
			</Link>
		</li>
	);
}
