"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRegistry = void 0;
exports.getOrCreateHistogram = getOrCreateHistogram;
exports.getOrCreateCounter = getOrCreateCounter;
exports.getOrCreateGauge = getOrCreateGauge;
const prom_client_1 = require("prom-client");
exports.metricsRegistry = new prom_client_1.Registry();
exports.metricsRegistry.setDefaultLabels({ app: 'food-delivery-backend' });
(0, prom_client_1.collectDefaultMetrics)({ register: exports.metricsRegistry });
function getOrCreateHistogram(config) {
    const existing = exports.metricsRegistry.getSingleMetric(config.name);
    if (existing)
        return existing;
    return new prom_client_1.Histogram({ ...config, registers: [exports.metricsRegistry] });
}
function getOrCreateCounter(config) {
    const existing = exports.metricsRegistry.getSingleMetric(config.name);
    if (existing)
        return existing;
    return new prom_client_1.Counter({ ...config, registers: [exports.metricsRegistry] });
}
function getOrCreateGauge(config) {
    const existing = exports.metricsRegistry.getSingleMetric(config.name);
    if (existing)
        return existing;
    return new prom_client_1.Gauge({ ...config, registers: [exports.metricsRegistry] });
}
//# sourceMappingURL=metrics.registry.js.map