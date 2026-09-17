export interface CounterStreamDto {
  nextValue: number;
  step: number;
  intervalMs: number;
  streaming: boolean;
}
