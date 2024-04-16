export function getWAFManagedRule(name: string, priority: number, stage: string) {
  return {
    name: `${stage}-${name}`,
    priority: priority,
    overrideAction: { none: {} },
    statement: {
      managedRuleGroupStatement: {
        name: name,
        vendorName: 'AWS',
        excludedRules: []
      }
    },
    visibilityConfig: {
      cloudWatchMetricsEnabled: true,
      metricName: `${stage}-${name}-rule`,
      sampledRequestsEnabled: true
    }
  }
}
