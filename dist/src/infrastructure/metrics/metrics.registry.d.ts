import { Counter, Gauge, Histogram, Registry } from 'prom-client';
export declare const metricsRegistry: Registry<"text/plain; version=0.0.4; charset=utf-8">;
type HistogramConfig = ConstructorParameters<typeof Histogram>[0];
type CounterConfig = ConstructorParameters<typeof Counter>[0];
type GaugeConfig = ConstructorParameters<typeof Gauge>[0];
export declare function getOrCreateHistogram(config: HistogramConfig): Histogram;
export declare function getOrCreateCounter(config: CounterConfig): Counter;
export declare function getOrCreateGauge(config: GaugeConfig): Gauge;
export {};
