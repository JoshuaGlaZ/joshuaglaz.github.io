import React from "react";
import { getProjects } from "../lib/markdown";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
	title: "Projects",
	description: "Case studies and technical projects built by Joshua Daniel Talahatu.",
};

export default function ProjectsPage() {
	const projects = getProjects();
	return <ProjectsClient projects={projects} />;
}
