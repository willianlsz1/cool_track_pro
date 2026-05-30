/**
 * CoolTrack Pro - Alert constants (domain layer)
 *
 * Pesos de severidade usados para ordenar/priorizar alertas.
 * Centralizado aqui para evitar divergência entre regras de manutenção e
 * superfícies operacionais.
 */

export const ALERT_SEVERITY_WEIGHT = { danger: 3, warn: 2, info: 1 };
