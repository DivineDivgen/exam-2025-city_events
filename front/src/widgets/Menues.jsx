import React, { useEffect, useState, useContext } from "react";
// import { AuthContext } from "@/context"; // if you need auth

function Menues() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// If protected: get token from context/localStorage
	// const { token } = useContext(AuthContext);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/menugroups", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						// Authorization: `Bearer ${token}` // if protected
					},
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const text = await res.text(); // handle empty/204
				const data = text ? JSON.parse(text) : [];
				setItems(data);
			} catch (e) {
				setError(e.message || "Failed to load");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <div>Loading…</div>;
	if (error) return <div style={{ color: "red" }}>{error}</div>;

	return (
		<div className="block">
			<ul className="flex flex-col gap-2 mt-2 mb-4 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
				{items.map((i) => {
					const slug = (i.name || "")
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "");
					return (
						<li
							key={i.id}
							className="relative flex items-center p-1 text-sm gap-x-2 text-slate-300"
						>
							<a href={`#${slug}`} className="!text-blue-300 hover:!text-blue-500">
								{i.title || i.name}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export default Menues;
