import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { z } from "zod";
import type { PlayerProfile } from "../types";
import { detectIssues, generatePlan, prioritiesFor } from "./recommendations";
interface BrowserTool {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
}
interface ToolRegistry {
  registerTool: (
    tool: BrowserTool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}
export function useTrainingTools(
  profile: PlayerProfile | null,
  openSession: () => void,
) {
  const current = useRef({ profile, openSession });
  current.current = { profile, openSession };
  useEffect(() => {
    const registry = (document as Document & { modelContext?: ToolRegistry })
      .modelContext;
    if (!registry?.registerTool) return;
    const lifecycle = new AbortController();
    const inputSchema = {
      type: "object",
      properties: {},
      additionalProperties: false,
    };
    const tools: BrowserTool[] = [
      {
        name: "get_training_summary",
        description:
          "Read the current player’s focus, active observations and generated practice plan. Does not change data.",
        inputSchema,
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute(input) {
          z.object({}).strict().parse(input);
          const p = current.current.profile;
          if (!p) return { status: "onboarding_required" };
          return {
            priorities: prioritiesFor(p).slice(0, 3),
            issues: detectIssues(p),
            plan: generatePlan(p).map((d) => ({
              session: d.day,
              drillIds: d.drills.map((x) => x.id),
            })),
          };
        },
      },
      {
        name: "open_session_logger",
        description:
          "Open the session form. This only starts entry; it does not save a session or record an issue.",
        inputSchema,
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          z.object({}).strict().parse(input);
          if (!current.current.profile)
            throw new Error("Complete onboarding first.");
          flushSync(() => current.current.openSession());
          return { status: "session_form_open" };
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          registry.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {
          /* Optional browser support does not affect the local app. */
        });
      } catch {
        /* Unsupported registry versions leave normal UI available. */
      }
    }
    return () => lifecycle.abort();
  }, []);
}
