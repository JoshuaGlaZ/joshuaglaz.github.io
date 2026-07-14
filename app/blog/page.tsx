import React from "react";
import { getGSoCPosts } from "../lib/markdown";
import BlogClient from "./BlogClient";

export const metadata = {
	title: "Dev Logs",
	description: "Weekly development logs and technical write-ups by Joshua Daniel Talahatu.",
};

export default function BlogPage() {
	const blogs = getGSoCPosts();
	return <BlogClient blogs={blogs} />;
}
