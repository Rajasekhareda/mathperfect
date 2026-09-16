export interface SolverResult {
  title: string;
  problemType: string;
  inputSummary: string;
  solution: string;
  steps: Array<{
    title: string;
    explanation: string;
    math?: string;
  }>;
  keyFormulas: string[];
  additionalData?: Record<string, any>;
}

export function solveQuadratic(a: number, b: number, c: number): SolverResult {
  if (a === 0) {
    throw new Error("Coefficient 'a' cannot be 0 in a quadratic equation (ax² + bx + c = 0).");
  }

  const discriminant = b * b - 4 * a * c;
  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);

  const steps: Array<{ title: string; explanation: string; math?: string }> = [];

  // Step 1: Identify coefficients
  steps.push({
    title: '1. Identify Coefficients',
    explanation: `For the standard form ax² + bx + c = 0:`,
    math: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`
  });

  // Step 2: Compute Discriminant
  let natureOfRoots = '';
  if (discriminant > 0) {
    natureOfRoots = 'Two distinct real roots (Δ > 0)';
  } else if (discriminant === 0) {
    natureOfRoots = 'One repeated real root (Δ = 0)';
  } else {
    natureOfRoots = 'Two complex conjugate roots (Δ < 0)';
  }

  steps.push({
    title: '2. Compute the Discriminant (Δ)',
    explanation: `Calculate Δ = b² - 4ac to determine root character: ${natureOfRoots}.`,
    math: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${discriminant}`
  });

  // Step 3: Quadratic Formula
  let root1Str = '';
  let root2Str = '';
  let rootsSummary = '';

  if (discriminant > 0) {
    const sqrtD = Math.sqrt(discriminant);
    const r1 = (-b + sqrtD) / (2 * a);
    const r2 = (-b - sqrtD) / (2 * a);
    root1Str = `x_1 = ${r1.toFixed(4).replace(/\\.0000$/, '')}`;
    root2Str = `x_2 = ${r2.toFixed(4).replace(/\\.0000$/, '')}`;
    rootsSummary = `x = ${r1.toFixed(4).replace(/\\.0000$/, '')} \\quad \\text{or} \\quad x = ${r2.toFixed(4).replace(/\\.0000$/, '')}`;

    steps.push({
      title: '3. Apply the Quadratic Formula',
      explanation: `Substitute a, b, and √Δ into x = (-b ± √Δ) / (2a):`,
      math: `x = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})} = \\frac{${-b} \\pm ${sqrtD.toFixed(4).replace(/\\.0000$/, '')}}{${2 * a}}`
    });

    steps.push({
      title: '4. Separate into Two Roots',
      explanation: `Compute both the positive and negative branches:`,
      math: `${root1Str}, \\qquad ${root2Str}`
    });
  } else if (discriminant === 0) {
    const r = -b / (2 * a);
    rootsSummary = `x = ${r.toFixed(4).replace(/\\.0000$/, '')} \\quad (\\text{multiplicity 2})`;
    steps.push({
      title: '3. Single Repeated Root',
      explanation: `Since Δ = 0, the single root is given by x = -b / (2a):`,
      math: `x = \\frac{-(${b})}{2(${a})} = ${r.toFixed(4).replace(/\\.0000$/, '')}`
    });
  } else {
    const realPart = (-b / (2 * a)).toFixed(4).replace(/\\.0000$/, '');
    const imagPart = (Math.sqrt(-discriminant) / (2 * Math.abs(a))).toFixed(4).replace(/\\.0000$/, '');
    rootsSummary = `x = ${realPart} \\pm ${imagPart}i`;

    steps.push({
      title: '3. Complex Roots Evaluation',
      explanation: `Since Δ < 0, √Δ = i√|Δ|:`,
      math: `x = \\frac{${-b} \\pm i\\sqrt{${-discriminant}}}{${2 * a}} = ${realPart} \\pm ${imagPart}i`
    });
  }

  // Step 4: Parabola Geometry
  steps.push({
    title: '5. Parabola Vertex & Geometry',
    explanation: `The vertex of the parabola y = ax² + bx + c occurs at (h, k):`,
    math: `h = -\\frac{b}{2a} = ${h.toFixed(3)}, \\quad k = f(h) = ${k.toFixed(3)} \\implies \\text{Vertex } (${h.toFixed(3)}, ${k.toFixed(3)})`
  });

  return {
    title: 'Quadratic Equation Solution',
    problemType: 'Algebra / Quadratic Equations',
    inputSummary: `${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
    solution: rootsSummary,
    steps,
    keyFormulas: [
      'Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)',
      'Discriminant: Δ = b² - 4ac',
      'Vertex Coordinates: (h, k) = (-b / 2a, c - b² / 4a)',
      'Axis of Symmetry: x = -b / (2a)'
    ],
    additionalData: {
      discriminant,
      natureOfRoots,
      vertex: { h: Number(h.toFixed(3)), k: Number(k.toFixed(3)) },
      roots: rootsSummary
    }
  };
}

export function solveLinearSystem(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): SolverResult {
  // a1*x + b1*y = c1
  // a2*x + b2*y = c2
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;

  const steps: Array<{ title: string; explanation: string; math?: string }> = [];

  steps.push({
    title: '1. Standard Matrix Representation',
    explanation: 'Write the system as a matrix equation A · X = B:',
    math: `\\begin{pmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ${c1} \\\\ ${c2} \\end{pmatrix}`
  });

  steps.push({
    title: "2. Compute the System Determinant (D)",
    explanation: 'Using Cramer\'s Rule, calculate the coefficient determinant D:',
    math: `D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1 * b2} - ${a2 * b1} = ${D}`
  });

  if (Math.abs(D) < 1e-9) {
    if (Math.abs(Dx) < 1e-9 && Math.abs(Dy) < 1e-9) {
      return {
        title: 'System of Linear Equations',
        problemType: 'Linear Algebra',
        inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
        solution: 'Infinitely many solutions (Coincident lines)',
        steps: [
          ...steps,
          {
            title: '3. Analysis of Dependent Equations',
            explanation: 'Both lines are collinear (D = 0, Dx = 0, Dy = 0), representing the same mathematical line.',
            math: '\\text{Dependent System with } \\infty \\text{ solutions}'
          }
        ],
        keyFormulas: ["Cramer's Rule: D = a₁b₂ - a₂b₁", 'Dx = c₁b₂ - c₂b₁', 'Dy = a₁c₂ - a₂c₁']
      };
    } else {
      return {
        title: 'System of Linear Equations',
        problemType: 'Linear Algebra',
        inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
        solution: 'No solution (Parallel, inconsistent lines)',
        steps: [
          ...steps,
          {
            title: '3. Inconsistent System',
            explanation: 'The determinant D = 0 but Dx or Dy ≠ 0. The two lines are parallel and never intersect.',
            math: '\\text{Inconsistent System: } \\emptyset'
          }
        ],
        keyFormulas: ["Cramer's Rule: D = a₁b₂ - a₂b₁", 'Parallel Lines Condition: a₁/a₂ = b₁/b₂ ≠ c₁/c₂']
      };
    }
  }

  const x = Dx / D;
  const y = Dy / D;

  steps.push({
    title: '3. Compute Determinants Dx and Dy',
    explanation: 'Replace x-column with constants for Dx, and y-column with constants for Dy:',
    math: `D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${Dx}, \\quad D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${Dy}`
  });

  steps.push({
    title: '4. Compute x and y',
    explanation: 'Divide Dx and Dy by D to get unique coordinates:',
    math: `x = \\frac{D_x}{D} = \\frac{${Dx}}{${D}} = ${x.toFixed(4).replace(/\\.0000$/, '')}, \\quad y = \\frac{D_y}{D} = \\frac{${Dy}}{${D}} = ${y.toFixed(4).replace(/\\.0000$/, '')}`
  });

  return {
    title: 'Linear System Solution',
    problemType: 'Linear Algebra',
    inputSummary: `${a1}x + ${b1}y = ${c1},  ${a2}x + ${b2}y = ${c2}`,
    solution: `x = ${x.toFixed(4).replace(/\\.0000$/, '')}, \\quad y = ${y.toFixed(4).replace(/\\.0000$/, '')}`,
    steps,
    keyFormulas: ["Cramer's Rule: x = Dx / D, y = Dy / D", 'Determinant: |A| = a₁b₂ - a₂b₁'],
    additionalData: { x, y, D, Dx, Dy }
  };
}

export function solvePolynomialCalculus(coefficients: number[]): SolverResult {
  // coefficients: [c_n, c_(n-1), ..., c_0] for c_n x^n + ... + c_0
  const degree = coefficients.length - 1;
  const derivCoeffs: number[] = [];
  const integCoeffs: number[] = [];

  for (let i = 0; i < coefficients.length - 1; i++) {
    const power = degree - i;
    derivCoeffs.push(coefficients[i] * power);
  }

  for (let i = 0; i < coefficients.length; i++) {
    const power = degree - i;
    integCoeffs.push(coefficients[i] / (power + 1));
  }

  const formatPoly = (coeffs: number[], startDeg: number) => {
    if (coeffs.length === 0) return '0';
    return coeffs
      .map((c, idx) => {
        const p = startDeg - idx;
        const val = Number(c.toFixed(3));
        if (val === 0) return '';
        const sign = idx > 0 && val > 0 ? '+ ' : val < 0 ? '- ' : '';
        const absVal = Math.abs(val);
        const coeffStr = absVal === 1 && p > 0 ? '' : `${absVal}`;
        const xStr = p > 1 ? `x^{${p}}` : p === 1 ? 'x' : '';
        return `${sign}${coeffStr}${xStr}`;
      })
      .filter(Boolean)
      .join(' ') || '0';
  };

  const origPoly = formatPoly(coefficients, degree);
  const derivPoly = formatPoly(derivCoeffs, degree - 1);
  const integPoly = `${formatPoly(integCoeffs, degree + 1)} + C`;

  return {
    title: 'Polynomial Calculus Operations',
    problemType: 'Calculus',
    inputSummary: `f(x) = ${origPoly}`,
    solution: `f'(x) = ${derivPoly}, \\quad \\int f(x)dx = ${integPoly}`,
    steps: [
      {
        title: '1. Identify Polynomial Degree & Terms',
        explanation: `Given polynomial of degree ${degree}:`,
        math: `f(x) = ${origPoly}`
      },
      {
        title: '2. Apply the Power Rule for Derivatives',
        explanation: 'Differentiate term by term using d/dx [a·x^n] = a·n·x^(n-1):',
        math: `f'(x) = \\frac{d}{dx}[${origPoly}] = ${derivPoly}`
      },
      {
        title: '3. Apply the Power Rule for Integrals',
        explanation: 'Antidifferentiate term by term using ∫ a·x^n dx = (a / (n+1))·x^(n+1) + C:',
        math: `\\int f(x)\\,dx = ${integPoly}`
      }
    ],
    keyFormulas: [
      'Derivative Power Rule: d/dx [x^n] = n·x^(n-1)',
      'Integral Power Rule: ∫ x^n dx = (x^(n+1)) / (n+1) + C',
      'Sum Rule: (f + g)\' = f\' + g\''
    ]
  };
}

export function solveFractionArithmetic(n1: number, d1: number, op: '+' | '-' | '*' | '/', n2: number, d2: number): SolverResult {
  if (d1 === 0 || d2 === 0) {
    throw new Error('Denominator cannot be zero.');
  }

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  let resN = 0;
  let resD = 1;
  const steps: Array<{ title: string; explanation: string; math?: string }> = [];

  if (op === '+' || op === '-') {
    const commonD = (d1 * d2) / gcd(d1, d2);
    const m1 = commonD / d1;
    const m2 = commonD / d2;
    const adjN1 = n1 * m1;
    const adjN2 = n2 * m2;

    steps.push({
      title: '1. Find the Least Common Multiple (LCM) of Denominators',
      explanation: `Denominators are ${d1} and ${d2}. LCM(${d1}, ${d2}) = ${commonD}.`,
      math: `\\text{LCM}(${d1}, ${d2}) = ${commonD}`
    });

    steps.push({
      title: '2. Convert Both Fractions to Common Denominator',
      explanation: `Multiply numerators by the respective scaling factors (${m1} and ${m2}):`,
      math: `\\frac{${n1} \\times ${m1}}{${d1} \\times ${m1}} = \\frac{${adjN1}}{${commonD}}, \\quad \\frac{${n2} \\times ${m2}}{${d2} \\times ${m2}} = \\frac{${adjN2}}{${commonD}}`
    });

    resN = op === '+' ? adjN1 + adjN2 : adjN1 - adjN2;
    resD = commonD;

    steps.push({
      title: '3. Combine the Numerators',
      explanation: `Keep the common denominator and ${op === '+' ? 'add' : 'subtract'} numerators:`,
      math: `\\frac{${adjN1} ${op} ${adjN2}}{${commonD}} = \\frac{${resN}}{${resD}}`
    });
  } else if (op === '*') {
    resN = n1 * n2;
    resD = d1 * d2;
    steps.push({
      title: '1. Multiply Numerators and Denominators Directly',
      explanation: 'For fraction multiplication, multiply numerators together and denominators together:',
      math: `\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}} = \\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${resN}}{${resD}}`
    });
  } else if (op === '/') {
    if (n2 === 0) throw new Error('Division by zero fraction.');
    resN = n1 * d2;
    resD = d1 * n2;
    steps.push({
      title: '1. Multiply by the Reciprocal (Invert and Multiply)',
      explanation: `The reciprocal of ${n2}/${d2} is ${d2}/${n2}:`,
      math: `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}} = \\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${resN}}{${resD}}`
    });
  }

  // Simplify final fraction
  const g = gcd(resN, resD);
  const simpN = resN / g;
  const simpD = resD / g;

  steps.push({
    title: '4. Simplify by Greatest Common Divisor (GCD)',
    explanation: `GCD of ${resN} and ${resD} is ${g}. Divide both by ${g}:`,
    math: `\\frac{${resN} \\div ${g}}{${resD} \\div ${g}} = \\frac{${simpN}}{${simpD}}`
  });

  return {
    title: 'Fraction Arithmetic',
    problemType: 'Arithmetic',
    inputSummary: `\\frac{${n1}}{${d1}} ${op === '*' ? '\\times' : op === '/' ? '\\div' : op} \\frac{${n2}}{${d2}}`,
    solution: simpD === 1 ? `${simpN}` : `\\frac{${simpN}}{${simpD}}`,
    steps,
    keyFormulas: [
      'Addition/Subtraction: a/b ± c/d = (ad ± bc) / bd',
      'Multiplication: a/b × c/d = (ac) / (bd)',
      'Division: a/b ÷ c/d = (ad) / (bc)'
    ]
  };
}
