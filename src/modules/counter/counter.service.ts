import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Subscription, timer } from 'rxjs';
import { CounterStreamDto } from './dto/response/counter-stream.js';

const DEFAULT_STEP = 1;
const DEFAULT_START_VALUE = 1;
const DEFAULT_INTERVAL_MS = 1000;
const MIN_INTERVAL_MS = 10;
const ENV_INTERVAL_MS = 'COUNTER_INTERVAL_MS';

interface CounterStreamState {
  current: number;
  step: number;
  streaming: boolean;
  emit: (value: number) => void;
  subscription: Subscription;
}

interface StartStreamOptions {
  emit: (value: number) => void;
  startFrom?: number;
}

@Injectable()
export class CounterService {
  private readonly logger = new Logger(CounterService.name);
  private readonly intervalMs: number;
  private readonly streams = new Map<string, CounterStreamState>();

  constructor(private readonly configService: ConfigService) {
    this.intervalMs = CounterService.resolveIntervalMs(
      this.configService.get<string | number>(ENV_INTERVAL_MS),
    );
  }

  start(clientId: string, options: StartStreamOptions): CounterStreamDto {
    const previous = this.streams.get(clientId);
    const step = previous?.step ?? DEFAULT_STEP;

    this.unsubscribe(clientId);

    const state: CounterStreamState = {
      current: this.resolveStartValue(step, previous, options.startFrom),
      step,
      streaming: true,
      emit: options.emit,
      subscription: new Subscription(),
    };
    this.streams.set(clientId, state);

    state.subscription.add(
      timer(0, this.intervalMs).subscribe(() => {
        state.current += state.step;
        state.emit(state.current);
      }),
    );

    this.logger.log(
      `Stream started for client "${clientId}" (first number ${state.current + state.step}, every ${this.intervalMs}ms)`,
    );

    return this.toDto(state);
  }

  setIncrement(
    clientId: string,
    step: number,
    startFrom?: number,
  ): CounterStreamDto {
    const state = this.streams.get(clientId);
    if (!state) {
      throw new WsException(`No counter stream found for client "${clientId}"`);
    }

    state.step = step;
    if (startFrom !== undefined) {
      state.current = startFrom - step;
    }

    this.logger.log(
      `Client "${clientId}" now adds ${step} on every tick (next number ${state.current + state.step})`,
    );

    return this.toDto(state);
  }

  stop(clientId: string): CounterStreamDto | undefined {
    const state = this.streams.get(clientId);
    if (!state) {
      return undefined;
    }

    this.unsubscribe(clientId);
    this.logger.log(`Stream paused for client "${clientId}"`);

    return this.toDto(state);
  }

  remove(clientId: string): void {
    this.stop(clientId);
    this.streams.delete(clientId);
  }

  getSnapshot(clientId: string): CounterStreamDto | undefined {
    const state = this.streams.get(clientId);
    return state ? this.toDto(state) : undefined;
  }

  private resolveStartValue(
    step: number,
    previous: CounterStreamState | undefined,
    startFrom: number | undefined,
  ): number {
    if (startFrom !== undefined) {
      return startFrom - step;
    }
    if (previous) {
      return previous.current;
    }
    return DEFAULT_START_VALUE - step;
  }

  private unsubscribe(clientId: string): void {
    const state = this.streams.get(clientId);
    if (!state) {
      return;
    }

    state.subscription.unsubscribe();
    state.streaming = false;
  }

  private toDto(state: CounterStreamState): CounterStreamDto {
    return {
      nextValue: state.current + state.step,
      step: state.step,
      intervalMs: this.intervalMs,
      streaming: state.streaming,
    };
  }

  private static resolveIntervalMs(raw: string | number | undefined): number {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < MIN_INTERVAL_MS) {
      return DEFAULT_INTERVAL_MS;
    }

    return Math.floor(parsed);
  }
}
