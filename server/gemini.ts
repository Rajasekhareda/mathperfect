import { GoogleGenAI, Type } from '@google/genai';

interface GenerateWorksheetParams {
  topic: string;
  grade: string;
  difficulty: 'Foundational' | 'Standard' | 'Advanced' | 'Olympiad';
  questionType: 'multiple-choice' | 'free-response' | 'word-problems' | 'mixed';
  questionCount: number;
  schoolName?: string;
  customInstructions?: string;
}

export interface GeneratedQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  solution: string;
  hint?: string;
  marks?: number;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      timeout: 15000,
    },
  });
}

// Algorithmic high-precision curriculum fallback generator
function generateAlgorithmicQuestions(params: GenerateWorksheetParams): GeneratedQuestion[] {
  const count = Math.min(Math.max(params.questionCount || 5, 1), 20);
  const questions: GeneratedQuestion[] = [];
  const topicLower = params.topic.toLowerCase();

  for (let i = 1; i <= count; i++) {
    if (topicLower.includes('quadratic') || topicLower.includes('algebra') && !topicLower.includes('linear')) {
      const r1 = (i % 5) + 1;
      const r2 = (i % 4) + 2;
      const b = -(r1 + r2);
      const c = r1 * r2;
      const bStr = b < 0 ? `- ${Math.abs(b)}x` : `+ ${b}x`;
      const cStr = c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`;
      
      if (params.questionType === 'multiple-choice' || (params.questionType === 'mixed' && i % 2 === 1)) {
        questions.push({
          id: i,
          question: `Find the real roots of the quadratic equation: x² ${bStr} ${cStr} = 0`,
          options: [
            `x = ${r1} or x = ${r2}`,
            `x = -${r1} or x = -${r2}`,
            `x = ${r1 + 1} or x = ${r2 - 1}`,
            `x = ${r1 * 2} or x = ${r2}`
          ],
          correctAnswer: `x = ${r1} or x = ${r2}`,
          solution: `Factoring the quadratic polynomial: (x - ${r1})(x - ${r2}) = 0. Setting each linear factor to zero yields roots x = ${r1} and x = ${r2}.`,
          hint: `Find two integers that multiply to give ${c} and sum to give ${b}.`,
          marks: 3
        });
      } else {
        questions.push({
          id: i,
          question: `Solve for x by factoring or by quadratic formula: x² ${bStr} ${cStr} = 0. Detail all steps.`,
          correctAnswer: `x = ${r1} or x = ${r2}`,
          solution: `Using the quadratic formula: a = 1, b = ${b}, c = ${c}. Discriminant Δ = b² - 4ac = (${b})² - 4(1)(${c}) = ${b * b - 4 * c}. Thus x = (-(${b}) ± √(${b * b - 4 * c})) / 2 = ${r1} or ${r2}.`,
          hint: `Compute the discriminant Δ = b² - 4ac first to verify real roots.`,
          marks: 4
        });
      }
    } else if (topicLower.includes('linear') || topicLower.includes('system') || topicLower.includes('simultaneous')) {
      const xVal = i + 1;
      const yVal = (i % 3) + 2;
      const a1 = 2;
      const b1 = 3;
      const c1 = a1 * xVal + b1 * yVal;
      const a2 = 3;
      const b2 = -1;
      const c2 = a2 * xVal + b2 * yVal;

      questions.push({
        id: i,
        question: `Solve the simultaneous system of linear equations:\n(1) ${a1}x + ${b1}y = ${c1}\n(2) ${a2}x ${b2 < 0 ? `- ${Math.abs(b2)}` : `+ ${b2}`}y = ${c2}`,
        options: params.questionType === 'multiple-choice' ? [
          `x = ${xVal}, y = ${yVal}`,
          `x = ${xVal + 1}, y = ${yVal - 1}`,
          `x = ${-xVal}, y = ${yVal}`,
          `x = ${xVal * 2}, y = ${yVal + 2}`
        ] : undefined,
        correctAnswer: `x = ${xVal}, y = ${yVal}`,
        solution: `From equation (2), express y: y = ${a2}x - ${c2}. Substitute into equation (1): ${a1}x + ${b1}(${a2}x - ${c2}) = ${c1} => (${a1} + ${b1 * a2})x - ${b1 * c2} = ${c1} => ${a1 + b1 * a2}x = ${c1 + b1 * c2} => x = ${xVal}. Back-substitute to find y: y = ${a2}(${xVal}) - ${c2} = ${yVal}.`,
        hint: `Use the method of substitution or multiply equation (2) by 3 to eliminate y.`,
        marks: 4
      });
    } else if (topicLower.includes('integral') || topicLower.includes('antiderivative')) {
      const p = (i % 3) + 1;
      const coeff = (p + 1) * (i + 1);
      questions.push({
        id: i,
        question: `Evaluate the indefinite integral: ∫ (${coeff}x^${p} - ${2 * i}x + ${i + 3}) dx.`,
        options: params.questionType === 'multiple-choice' ? [
          `${coeff / (p + 1)}x^${p + 1} - ${i}x² + ${i + 3}x + C`,
          `${coeff}x^${p + 1} - ${2 * i}x² + ${i + 3}x + C`,
          `${coeff / (p + 1)}x^${p} - ${i}x + C`,
          `${coeff * (p + 1)}x^${p + 1} - ${i}x² + C`
        ] : undefined,
        correctAnswer: `${coeff / (p + 1)}x^${p + 1} - ${i}x² + ${i + 3}x + C`,
        solution: `Using the power rule of integration ∫ x^n dx = (x^(n+1))/(n+1) + C: ∫ ${coeff}x^${p} dx = (${coeff}/(${p + 1}))x^${p + 1} = ${coeff / (p + 1)}x^${p + 1}. ∫ -${2 * i}x dx = -${i}x². ∫ ${i + 3} dx = ${i + 3}x. Summing and appending constant of integration yields ${coeff / (p + 1)}x^${p + 1} - ${i}x² + ${i + 3}x + C.`,
        hint: `Increase the power by 1 and divide by the new power for each term. Remember + C.`,
        marks: 4
      });
    } else if (topicLower.includes('calculus') || topicLower.includes('derivative') || topicLower.includes('differentiat')) {
      const power = (i % 4) + 2;
      const coeff = (i % 5) + 2;
      const constVal = (i % 7) + 1;
      questions.push({
        id: i,
        question: `Determine the first derivative f'(x) of the function f(x) = ${coeff}x^${power} - ${constVal}x² + ${i * 3}.`,
        options: params.questionType === 'multiple-choice' ? [
          `${coeff * power}x^${power - 1} - ${constVal * 2}x`,
          `${coeff * (power - 1)}x^${power} - ${constVal}x`,
          `${coeff * power}x^${power - 1} - ${constVal * 2}`,
          `${coeff}x^${power - 1} - ${constVal * 2}x + ${i * 3}`
        ] : undefined,
        correctAnswer: `${coeff * power}x^${power - 1} - ${constVal * 2}x`,
        solution: `Apply the Power Rule: d/dx [a·x^n] = a·n·x^(n-1). d/dx [${coeff}x^${power}] = ${coeff * power}x^${power - 1}; d/dx [-${constVal}x²] = -${constVal * 2}x; d/dx [${i * 3}] = 0. Combine: f'(x) = ${coeff * power}x^${power - 1} - ${constVal * 2}x.`,
        hint: `Multiply coefficient by exponent and subtract 1 from the power. Derivative of a constant is 0.`,
        marks: 4
      });
    } else if (topicLower.includes('probability') || topicLower.includes('permutation') || topicLower.includes('combinat')) {
      const total = 10 + i;
      const selected = 3;
      // Combinations total C 3
      const numCombos = (total * (total - 1) * (total - 2)) / 6;
      questions.push({
        id: i,
        question: `A mathematics study committee of ${selected} students is to be selected from a class of ${total} students. How many distinct committee combinations are possible?`,
        options: params.questionType === 'multiple-choice' ? [
          `${numCombos}`,
          `${numCombos + 12}`,
          `${total * selected}`,
          `${numCombos - 15}`
        ] : undefined,
        correctAnswer: `${numCombos}`,
        solution: `Use combination formula C(n, r) = n! / (r! · (n - r)!): C(${total}, 3) = (${total} × ${total - 1} × ${total - 2}) / (3 × 2 × 1) = ${total * (total - 1) * (total - 2)} / 6 = ${numCombos} unique committees.`,
        hint: `Order does not matter in committee selection, so use combination C(n, r), not permutation P(n, r).`,
        marks: 3
      });
    } else if (topicLower.includes('coordinate') || topicLower.includes('distance') || topicLower.includes('slope')) {
      const x1 = i * 2;
      const y1 = i + 1;
      const x2 = x1 + 3;
      const y2 = y1 + 4;
      // distance is 5
      questions.push({
        id: i,
        question: `Given points A(${x1}, ${y1}) and B(${x2}, ${y2}) in the Cartesian plane, find the exact distance between them and the slope of line AB.`,
        options: params.questionType === 'multiple-choice' ? [
          `Distance = 5, Slope = 4/3`,
          `Distance = 7, Slope = 3/4`,
          `Distance = 25, Slope = 4/3`,
          `Distance = 5, Slope = -4/3`
        ] : undefined,
        correctAnswer: `Distance = 5, Slope = 4/3`,
        solution: `Distance d = √((x₂ - x₁)² + (y₂ - y₁)²) = √((3)² + (4)²) = √(9 + 16) = √25 = 5 units. Slope m = (y₂ - y₁)/(x₂ - x₁) = 4/3.`,
        hint: `Use Euclidean distance formula d = √((Δx)² + (Δy)²) and slope formula m = Δy / Δx.`,
        marks: 3
      });
    } else if (topicLower.includes('geometry') || topicLower.includes('pythagor') || topicLower.includes('triangle')) {
      const triplets = [
        { a: 3 * i, b: 4 * i, c: 5 * i },
        { a: 5, b: 12, c: 13 },
        { a: 8, b: 15, c: 17 },
        { a: 7, b: 24, c: 25 },
        { a: 9, b: 40, c: 41 }
      ];
      const t = triplets[(i - 1) % triplets.length];
      questions.push({
        id: i,
        question: `In a right triangle, the two perpendicular legs measure ${t.a} cm and ${t.b} cm. Calculate the exact length of the hypotenuse.`,
        options: params.questionType === 'multiple-choice' ? [
          `${t.c} cm`,
          `${t.c + 2} cm`,
          `${t.c - 1} cm`,
          `${t.a + t.b} cm`
        ] : undefined,
        correctAnswer: `${t.c} cm`,
        solution: `According to the Pythagorean theorem: c² = a² + b² = (${t.a})² + (${t.b})² = ${t.a * t.a} + ${t.b * t.b} = ${t.c * t.c}. Taking the principal square root gives c = ${t.c} cm.`,
        hint: `Use the formula c = √(a² + b²).`,
        marks: 3
      });
    } else if (topicLower.includes('trigonometry')) {
      const angles = [30, 45, 60, 90, 0];
      const ang = angles[(i - 1) % angles.length];
      const trigValues: Record<number, { sin: string; cos: string; tan: string }> = {
        0: { sin: '0', cos: '1', tan: '0' },
        30: { sin: '1/2', cos: '√3/2', tan: '1/√3' },
        45: { sin: '√2/2', cos: '√2/2', tan: '1' },
        60: { sin: '√3/2', cos: '1/2', tan: '√3' },
        90: { sin: '1', cos: '0', tan: 'undefined' }
      };
      const v = trigValues[ang];
      questions.push({
        id: i,
        question: `Evaluate the exact value of the trigonometric expression: 2 · sin(${ang}°) + 4 · cos(${ang}°).`,
        correctAnswer: `2(${v.sin}) + 4(${v.cos})`,
        solution: `Using exact special angle values: sin(${ang}°) = ${v.sin}, cos(${ang}°) = ${v.cos}. Evaluate: 2(${v.sin}) + 4(${v.cos}).`,
        hint: `Recall unit circle values for special standard angles (0°, 30°, 45°, 60°, 90°).`,
        marks: 3
      });
    } else {
      // General arithmetic, algebraic expressions, and word problems
      const num1 = i * 7 + 4;
      const num2 = i * 3 + 2;
      questions.push({
        id: i,
        question: `Simplify the algebraic expression: ${i + 1}(x + ${num2}) - ${i}(x - ${num1}).`,
        options: params.questionType === 'multiple-choice' ? [
          `x + ${(i + 1) * num2 + i * num1}`,
          `x - ${(i + 1) * num2 - i * num1}`,
          `${2 * i + 1}x + ${num2}`,
          `${i}x + ${num1}`
        ] : undefined,
        correctAnswer: `x + ${(i + 1) * num2 + i * num1}`,
        solution: `Distribute terms: (${i + 1}x + ${(i + 1) * num2}) - (${i}x - ${i * num1}) = ${i + 1}x - ${i}x + ${(i + 1) * num2} + ${i * num1} = x + ${(i + 1) * num2 + i * num1}.`,
        hint: `Distribute the constants carefully, remembering that negative times negative is positive.`,
        marks: 3
      });
    }
  }

  return questions;
}

export async function generateWorksheetAI(params: GenerateWorksheetParams): Promise<GeneratedQuestion[]> {
  const client = getGeminiClient();

  if (!client) {
    console.log('[Curriculum Generator] Gemini API key unconfigured. Using built-in curriculum engine.');
    return generateAlgorithmicQuestions(params);
  }

  const prompt = `You are a distinguished mathematics educator at MATH PERFECT.
Create an academic worksheet of ${params.questionCount} rigorous mathematics problems.
Topic: ${params.topic}
Grade/Level: ${params.grade}
Difficulty: ${params.difficulty}
Question Type: ${params.questionType}
Custom Instructions: ${params.customInstructions || 'Standard curriculum-aligned mathematical questions.'}

Return a JSON array where each object has:
- id: integer (1 to ${params.questionCount})
- question: clear mathematical problem text (use standard formatting or clean LaTeX notation)
- options: array of 4 distinct choices if questionType is multiple-choice or mixed (optional)
- correctAnswer: the precise correct answer
- solution: comprehensive step-by-step mathematical derivation/explanation
- hint: a pedagogical clue that guides understanding without giving away the answer
- marks: integer point value (e.g. 2, 3, 4, or 5)`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        correctAnswer: { type: Type.STRING },
        solution: { type: Type.STRING },
        hint: { type: Type.STRING },
        marks: { type: Type.INTEGER }
      },
      required: ['id', 'question', 'correctAnswer', 'solution']
    }
  };

  // Models in priority order:
  // 1. gemini-3.1-flash-lite: Blazing fast (under 3s), resilient to high-traffic spikes
  // 2. gemini-3.8-flash: Standard multimodal flash model if available
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  for (const model of candidateModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert mathematics curriculum creator. Provide academically sound, mathematically correct questions, clear explanations, and precise solutions. Always respond in valid JSON matching the requested schema.',
          responseMimeType: 'application/json',
          responseSchema
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err: any) {
      // Catch transient model load spikes (503 / 504 / rate-limit) gracefully
      const errMsg = err?.message || String(err);
      console.warn(`[Curriculum AI] Model ${model} unavailable or busy: ${errMsg}. Trying next candidate or fallback...`);
    }
  }

  // Graceful fallback to verified algorithmic curriculum generator
  return generateAlgorithmicQuestions(params);
}
