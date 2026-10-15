export type ComplexityMetrics = {
  cyclomatic: number;
  maintainability: number;
  cognitive: number;
  loc: number;
  risk: 'low' | 'moderate' | 'high' | 'critical';
};

export function calculateComplexity(code: string): ComplexityMetrics {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      cyclomatic: 0,
      maintainability: 100,
      cognitive: 0,
      loc: 0,
      risk: 'low'
    };
  }

  const loc = code.split('\n').filter(line => line.trim().length > 0).length;
  
  // Basic heuristic-based cyclomatic complexity counting keywords
  const controlKeywords = [
    /\bif\b/g, /\belse\b/g, /\bfor\b/g, /\bwhile\b/g, /\bcase\b/g, 
    /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g, /\?/, /\bmap\b/g, /\bfilter\b/g
  ];
  
  let complexityCount = 1;
  controlKeywords.forEach(regex => {
    const matches = code.match(regex);
    if (matches) complexityCount += matches.length;
  });

  // Basic maintainability index calculation mock
  const maintainability = Math.max(0, Math.min(100, 100 - (complexityCount * 2) - (loc / 10)));
  
  // Cognitive complexity simplified mock
  const cognitive = Math.floor(complexityCount * 1.2);

  let risk: ComplexityMetrics['risk'] = 'low';
  if (complexityCount > 15 || loc > 100) risk = 'critical';
  else if (complexityCount > 10) risk = 'high';
  else if (complexityCount > 5) risk = 'moderate';

  return {
    cyclomatic: complexityCount,
    maintainability: Math.round(maintainability),
    cognitive,
    loc,
    risk
  };
}
