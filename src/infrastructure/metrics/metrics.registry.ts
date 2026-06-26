import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const metricsRegistry = new Registry();

metricsRegistry.setDefaultLabels({ app: 'food-delivery-backend' });

collectDefaultMetrics({ register: metricsRegistry });

type HistogramConfig = ConstructorParameters<typeof Histogram>[0];
type CounterConfig = ConstructorParameters<typeof Counter>[0];
type GaugeConfig = ConstructorParameters<typeof Gauge>[0];

/** Returns the existing Histogram if already registered, otherwise creates it. */
export function getOrCreateHistogram(config: HistogramConfig): Histogram {
  const existing = metricsRegistry.getSingleMetric(config.name as string);
  if (existing) return existing as Histogram;
  return new Histogram({ ...config, registers: [metricsRegistry] });
}

/** Returns the existing Counter if already registered, otherwise creates it. */
export function getOrCreateCounter(config: CounterConfig): Counter {
  const existing = metricsRegistry.getSingleMetric(config.name as string);
  if (existing) return existing as Counter;
  return new Counter({ ...config, registers: [metricsRegistry] });
}

/** Returns the existing Gauge if already registered, otherwise creates it. */
export function getOrCreateGauge(config: GaugeConfig): Gauge {
  const existing = metricsRegistry.getSingleMetric(config.name as string);
  if (existing) return existing as Gauge;
  return new Gauge({ ...config, registers: [metricsRegistry] });
}
