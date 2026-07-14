"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { Award, Calendar, GraduationCap, MapPin } from "lucide-react";
import { Card } from "./card";

interface WorkItem {
  period: string;
  title: string;
  company: string;
  location?: string;
  summary: string;
  bullets: string[];
}

interface EducationItem {
  icon: "degree" | "award";
  period: string;
  name: string;
  institution: string;
  detail: string;
  note?: string;
}

const workExperience: WorkItem[] = [
  {
    period: "May 2024 - August 2024",
    title: "Open Source Contributor - GSoC 2024",
    company: "NumFOCUS / gems-uff noWorkflow",
    location: "Remote",
    summary:
      "Extended Python provenance tooling with AST-level trial diffing and backward program slicing for reproducible computational workflows.",
    bullets: [
      "Adapted Zhang-Shasha tree-edit distance to compare Python AST records stored in noWorkflow's SQLite provenance schema.",
      "Implemented backward slicing for the now show --slice workflow and improved query performance through targeted database indexes.",
      "Added deterministic synthetic-trial tests so AST comparison and slicing behavior could be verified without fragile fixtures."
    ]
  },
  {
    period: "2025 - 2026",
    title: "Backend and ML Systems Builder",
    company: "KerjaHebat AI recommender prototype",
    location: "Surabaya, Indonesia",
    summary:
      "Built and audited a cold-start job matching pipeline that combines semantic retrieval, structured metadata, and baseline comparisons.",
    bullets: [
      "Prototyped dense retrieval with multilingual E5 embeddings and FAISS candidate generation for resume and vacancy matching.",
      "Compared embedding retrieval against BM25, TF-IDF, rules, and traditional ML baselines to keep the portfolio claim evidence-backed.",
      "Built parsing and normalization endpoints for PDF/DOCX resumes with skill taxonomy mapping for downstream ranking experiments."
    ]
  },
  {
    period: "2025 - 2026",
    title: "Predictive Maintenance Demo Builder",
    company: "NIST Genesis anomaly detection service",
    location: "Surabaya, Indonesia",
    summary:
      "Turned anomaly-detection notebooks into an API-first maintenance demo with explicit model configuration and ERP-style workflow hooks.",
    bullets: [
      "Served a champion anomaly model through FastAPI using a runtime inference config instead of hardcoded notebook assumptions.",
      "Designed an idempotent ERP/CMMS webhook flow to create maintenance work orders without duplicate device-timestamp events.",
      "Documented a free-tier-friendly AWS Lightsail deployment path and Prometheus-style operational metrics for portfolio review."
    ]
  }
];

const educationHistory: EducationItem[] = [
  {
    icon: "degree",
    period: "2021 - 2025",
    name: "B.S. Informatics Engineering / Computer Science",
    institution: "Universitas Surabaya (UBAYA)",
    detail:
      "Focused on Python backend development, Django/FastAPI systems, retrieval pipelines, and applied machine-learning workflows.",
    note: "Surabaya, Indonesia"
  }
];

const certificationsHistory: EducationItem[] = [
  {
    icon: "award",
    period: "March 2026",
    name: "AWS Certified AI Practitioner",
    institution: "Amazon Web Services",
    detail:
      "Credential focused on AWS AI services, responsible AI concepts, and practical AI/ML workload framing on cloud infrastructure."
  },
  {
    icon: "award",
    period: "December 2025",
    name: "GCP Associate Cloud Engineer",
    institution: "Google Cloud Platform",
    detail:
      "Credential focused on deploying, managing, and monitoring cloud workloads across Google Cloud services."
  },
  {
    icon: "award",
    period: "June 2025",
    name: "Undergraduate Cyber Security Certification",
    institution: "University of Texas at Arlington",
    detail:
      "Covered cryptography, secure programming, network security, intrusion detection, firewalls, and system-hardening fundamentals."
  }
];

const tabs = [
  { id: "work", label: "Work" },
  { id: "education", label: "Education" }
];

export function Journey() {
  const [activeTab, setActiveTab] = useState<string>("work");
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const tab = tabsRef.current[activeTab];
    if (tab) {
      setHighlightStyle({ left: tab.offsetLeft, width: tab.offsetWidth });
    }
  }, [activeTab]);

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Journey tabs"
          className="relative inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-950/80 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <span
            aria-hidden="true"
            className="absolute bottom-1 top-1 rounded-full bg-zinc-800/90 ring-1 ring-zinc-700/70 transition-[left,width] duration-300 ease-out"
            style={{ left: highlightStyle.left, width: highlightStyle.width }}
          />
          {tabs.map((tab) => {
            const isSelected = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                ref={(el) => {
                  tabsRef.current[tab.id] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium uppercase tracking-normal transition-colors duration-200 sm:px-5 ${
                  isSelected ? "text-zinc-100" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12">
        {activeTab === "work" ? (
          <WorkTimeline />
        ) : (
          <EducationTimeline />
        )}
      </div>
    </div>
  );
}

function TimelineList({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-zinc-600/50 via-zinc-700 to-zinc-900 md:left-[13px]"
      />
      <ul className="relative space-y-8 md:space-y-10">{children}</ul>
    </div>
  );
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-10 md:pl-12">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 flex h-3 w-3 items-center justify-center rounded-full border-2 border-zinc-400 bg-zinc-950 shadow-[0_0_0_5px_rgba(9,9,11,0.8)]"
      />
      {children}
    </li>
  );
}

function WorkTimeline() {
  return (
    <TimelineList>
      {workExperience.map((item) => (
        <TimelineItem key={`${item.company}-${item.period}`}>
          <Card>
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.period}
                </p>
                {item.location && (
                  <p className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {item.location}
                  </p>
                )}
              </div>
              <h3 className="card-title-glitch mt-3 font-display text-xl font-semibold tracking-normal text-zinc-100 sm:text-2xl" data-text={item.title}>
                <span>{item.title}</span>
              </h3>
              <p className="mt-1 text-sm font-medium text-zinc-300">{item.company}</p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{item.summary}</p>
              <ul className="mt-5 space-y-2.5 border-t border-zinc-800/80 pt-5">
                {item.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </TimelineItem>
      ))}
    </TimelineList>
  );
}

function EducationTimeline() {
  return (
    <TimelineList>
      {educationHistory.map((item, idx) => (
        <TimelineItem key={`edu-${idx}`}>
          <EducationCard item={item} />
        </TimelineItem>
      ))}
      {certificationsHistory.map((item, idx) => (
        <TimelineItem key={`cert-${idx}`}>
          <EducationCard item={item} />
        </TimelineItem>
      ))}
    </TimelineList>
  );
}

function EducationCard({ item }: { item: EducationItem }) {
  const Icon = item.icon === "degree" ? GraduationCap : Award;

  return (
    <Card>
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-zinc-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">{item.period}</p>
              {item.note && (
                <span className="inline-flex w-fit items-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-700/60">
                  {item.note}
                </span>
              )}
            </div>
            <h3 className="card-title-glitch mt-2 font-display text-lg font-semibold tracking-normal text-zinc-100 sm:text-xl" data-text={item.name}>
              <span>{item.name}</span>
            </h3>
            <p className="text-sm font-medium text-zinc-300">{item.institution}</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.detail}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
