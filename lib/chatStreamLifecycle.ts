export class ChatStreamLifecycle {
  done = false;
  error: string | null = null;
  private readonly signal: AbortSignal;

  constructor(signal: AbortSignal) { this.signal = signal; }

  accept(type: string, message?: string): boolean {
    if (this.signal.aborted || this.done || this.error) return false;
    if (type === "done") this.done = true;
    if (type === "error") this.error = message || "An error occurred while generating recommendations.";
    return true;
  }

  assertComplete(receivedAnything: boolean): void {
    if (this.signal.aborted) throw new DOMException("Request cancelled", "AbortError");
    if (this.error) throw new Error(this.error);
    if (!receivedAnything) throw new Error("Server returned an empty streaming response");
    if (!this.done) throw new Error("The response ended before completion. Please retry.");
  }
}
