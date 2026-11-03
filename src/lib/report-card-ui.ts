import type { Grade, Mark } from "./report-card";
export const GRADE_CLASS: Record<Grade, string> = { A: "bg-[#1f7a3a]", B: "bg-royal", C: "bg-[#b26b00]", D: "bg-coral", F: "bg-cta" };
export const MARK_CLASS: Record<Mark, string> = { pass: "text-[#1f7a3a]", partial: "text-[#b26b00]", missing: "text-cta", na: "text-gray-500" };
