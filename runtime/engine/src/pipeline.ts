import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PipelineStep, TaskPhase, TaskStatus } from "./types";

export const PIPELINE_ORDER: TaskPhase[] = [
  "analyze", "meeting", "architect", "code", "fix", "test", "review", "build", "ui-ux", "persist",
];

export const AGENT_MAP: Record<TaskPhase, string> = {
  analyze: "pxh-pm",
  meeting: "pxh-pm",
  architect: "pxh-architect",
  code: "pxh-expert",
  fix: "pxh-fix-bugs",
  test: "pxh-qa",
  review: "pxh-review-code",
  build: "pxh-devops",
  "ui-ux": "pxh-ui-ux",
  persist: "pxh-save-history",
};

export class Pipeline {
  private steps: PipelineStep[] = [];
  private filePath: string;

  constructor(sessionDir?: string) {
    const base = sessionDir ?? process.cwd();
    this.filePath = join(base, ".pipeline-state.json");
  }

  async load(): Promise<void> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      this.steps = JSON.parse(raw);
    } catch {
      this.steps = [];
    }
  }

  async save(): Promise<void> {
    await writeFile(this.filePath, JSON.stringify(this.steps, null, 2), "utf-8");
  }

  currentPhase(): TaskPhase | null {
    const incomplete = PIPELINE_ORDER.find(p => {
      const s = this.steps.find(st => st.phase === p);
      return !s || s.status !== "pass";
    });
    return incomplete ?? null;
  }

  isComplete(): boolean {
    return this.currentPhase() === null;
  }

  async startPhase(phase: TaskPhase): Promise<boolean> {
    if (this.currentPhase() !== phase) return false;
    const existing = this.steps.findIndex(s => s.phase === phase);
    const step: PipelineStep = { phase, agent: AGENT_MAP[phase], status: undefined };
    if (existing >= 0) {
      this.steps[existing] = step;
    } else {
      this.steps.push(step);
    }
    await this.save();
    return true;
  }

  async completePhase(phase: TaskPhase, status: TaskStatus, output?: string): Promise<void> {
    const idx = this.steps.findIndex(s => s.phase === phase);
    if (idx >= 0) {
      this.steps[idx].status = status;
      if (output) this.steps[idx].output = output;
    }
    await this.save();
  }

  reset(): void {
    this.steps = [];
  }

  getSteps(): PipelineStep[] {
    return [...this.steps];
  }
}
