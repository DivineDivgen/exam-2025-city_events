import React, { useState, useRef, useEffect } from "react";
// import Menues from "./widgets/Menues.jsx";

const Navbar = () => {
	const [showMenu, setShowMenu] = useState(false);
	const [menuGroups, setMenuGroups] = useState([]);
	const [loadingGroups, setLoadingGroups] = useState(true);
	const [groupsError, setGroupsError] = useState(null);
	const menuRef = useRef(null);

	const toggleMenu = () => setShowMenu((s) => !s);

	useEffect(() => {
		function handleClickOutside(e) {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setShowMenu(false);
			}
		}
		function handleKey(e) {
			if (e.key === "Escape") setShowMenu(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
			document.removeEventListener("keydown", handleKey);
		};
	}, []);

	return (
		<div>
			<nav className="block w-full max-w-screen-lg px-4 py-2 mx-auto bg-slate-900 border border-slate-800 shadow-md rounded-md lg:px-8 lg:py-3 mt-10 text-slate-200">
				<div className="container flex flex-wrap items-center justify-between mx-auto">
					<a
						href="#"
						className="mr-4 block cursor-pointer py-1.5 text-base font-semibold !text-blue-300 visited:!text-blue-300 hover:!text-blue-500"
					>
						TVS
					</a>

					{/* <Menues /> */}

					<div className="hidden lg:block">
						<ul className="flex flex-col gap-2 mt-2 mb-4 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
							<li className="relative flex items-center p-1 text-sm gap-x-2 text-slate-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="1.5"
									stroke="currentColor"
									className="h-6 w-6 text-slate-400"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
									/>
								</svg>

								<div className="relative">
									{" "}
									{/* anchor + menu share this relative container */}
									<a
										id="account-button"
										role="button"
										tabIndex={0}
										onClick={(e) => {
											e.stopPropagation();
											toggleMenu();
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												e.stopPropagation();
												toggleMenu();
											}
										}}
										aria-expanded={showMenu}
										aria-controls="account-menu"
										className="flex items-center cursor-pointer !text-blue-300 visited:!text-blue-300 hover:!text-blue-500 no-underline"
									>
										Account
									</a>
									{showMenu && (
										<ul
											id="account-menu"
											ref={menuRef}
											role="menu"
											aria-labelledby="account-button"
											className="absolute left-0 top-full mt-2 z-10 min-w-[180px] overflow-auto rounded-lg border border-slate-700 bg-slate-800 bg-gray-900 p-1.5 shadow-lg focus:outline-none text-slate-100"
										>
											<li
												role="menuitem"
												className="cursor-pointer text-slate-100 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-700 text-blue-300 visited:text-blue-300 hover:text-blue-500"
											>
												<a
													href="http://localhost:81/auth/sign-up"
													className="!text-blue-300 visited:!text-blue-300 hover:!text-blue-500"
												>
													Sign-up
												</a>
											</li>
											<li
												role="menuitem"
												className="cursor-pointer text-slate-100 flex w-full text-sm items-center rounded-md p-3 transition-all hover:bg-slate-700 text-blue-300 visited:text-blue-300 hover:text-blue-500"
											>
												<a
													href="http://localhost:81/auth/sign-in"
													className="!text-blue-300 visited:!text-blue-300 hover:!text-blue-500"
												>
													Log-in
												</a>
											</li>
										</ul>
									)}
								</div>
							</li>
						</ul>
					</div>
				</div>
			</nav>
		</div>
	);
};

export default Navbar;
