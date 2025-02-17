"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";

export default function AutoAnimateProvider({
	children,
}: Readonly<{ children: ReactNode }>) {
	const [parent] = useAutoAnimate();

	return <div ref={parent}>{children}</div>;
}
