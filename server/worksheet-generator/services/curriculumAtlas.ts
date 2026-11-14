/**
 * CURRICULUM ATLAS - Universal & CBSE Matrix
 * Complete coverage: Kindergarten (KG) to Grade 10 (and 11-12)
 * Single source of truth for generator routing, DB indexing, and prompt grounding.
 */

export interface AtlasChapter {
  id: string;
  board: string;
  grade: string;
  number: number;
  name: string;
  aliases: string[];
  subtopics: string[];
  questionVarieties?: string[];
}

const ATLAS: AtlasChapter[] = [];

function add(
  gradeStr: string,
  prefix: string,
  chapters: [number, string, string[], string[], string[]?][]
): void {
  for (const [number, name, aliases, subtopics, questionVarieties] of chapters) {
    ATLAS.push({
      id: `${prefix}-${String(number).padStart(2, "0")}`,
      board: "Universal / CBSE",
      grade: gradeStr,
      number,
      name,
      aliases,
      subtopics,
      questionVarieties: questionVarieties || ["MCQ", "SHORT_ANSWER", "WORD_PROBLEM", "STEP_BY_STEP"]
    });
  }
}

// ----------------- KINDERGARTEN (KG) -----------------
add("KG", "kg", [
  [1, "Pre-Math Basics & Sorting", ["Early Math", "Classification"],
    ["Big and Small", "Tall and Short", "Heavy and Light", "Sorting by Color and Shape"],
    ["Visual Choice", "Match Pairs", "Circle the Biggest", "Pattern Completion"]],
  [2, "Numbers 1 to 20", ["Number Sense", "Counting"],
    ["Counting Objects", "Number Recognition", "Forward Counting", "Missing Number in Sequence"],
    ["Count and Write", "Match Number to Dots", "Missing Number", "True or False"]]
]);

// ----------------- GRADE 1 -----------------
add("Grade 1", "g01", [
  [1, "Numbers up to 100", ["Two-Digit Numbers", "Place Value 10s"],
    ["Tens and Ones", "Number Names", "Before, After, Between", "Comparing Numbers (<, >, =)"],
    ["Fill in the Blanks", "Multiple Choice", "Expanded Form", "Ascending Order"]],
  [2, "Addition & Subtraction within 20", ["Basic Operations", "Sum and Difference"],
    ["Number Line Addition", "Addition on Fingers", "Word Problems", "Subtraction by Crossing Out"],
    ["Horizontal Calculation", "Vertical Grid", "Story Problems", "Fact Families"]],
  [3, "Shapes & Space", ["Geometry Intro", "2D Shapes"],
    ["Circle, Triangle, Square, Rectangle", "Roll and Slide", "Inside and Outside"],
    ["Identify Shapes", "Draw and Color", "Counting Edges and Corners"]]
]);

// ----------------- GRADE 2 -----------------
add("Grade 2", "g02", [
  [1, "Numbers up to 1000", ["Three-Digit Numbers", "Hundreds Place"],
    ["Hundreds, Tens, Ones", "Skip Counting (2s, 5s, 10s)", "Even and Odd Numbers"],
    ["Place Value Chart", "Expanded Form", "Order of Numbers", "Fill in Blanks"]],
  [2, "Addition & Subtraction with Regrouping", ["Carrying and Borrowing"],
    ["2-digit addition with carry", "2-digit subtraction with borrow", "Word problems"],
    ["Column Addition", "Word Scenarios", "Missing Digit Puzzles"]],
  [3, "Introduction to Multiplication", ["Repeated Addition", "Times Tables"],
    ["Tables of 2, 3, 4, 5, 10", "Array Models", "Multiplication Stories"],
    ["Write as Multiplication", "Grid Multiplication", "Fast Facts Drill"]]
]);

// ----------------- GRADE 3 -----------------
add("Grade 3", "g03", [
  [1, "4-Digit Numbers", ["Thousands Place", "Place Value System"],
    ["Reading & writing 4-digit numbers", "Face value & place value", "Roman Numerals up to XX"],
    ["Number Names", "Abacus Representation", "Predecessor & Successor"]],
  [2, "Multiplication & Division", ["Multi-digit Operations"],
    ["Tables 6 to 12", "Multiplying 3-digit by 1-digit", "Division as sharing", "Long division intro"],
    ["Dividend-Divisor-Quotient", "Word Problems", "True/False", "Mental Math"]],
  [3, "Fractions Basics", ["Parts of a Whole"],
    ["Half, One-Third, One-Fourth", "Numerator & Denominator", "Fraction of a collection"],
    ["Shaded Fraction Identification", "Coloring Parts", "Word Questions"]]
]);

// ----------------- GRADE 4 -----------------
add("Grade 4", "g04", [
  [1, "Large Numbers (5 and 6 Digits)", ["Indian & International Place Value"],
    ["Lakhs place", "Commas and periods", "Rounding off to nearest 10, 100, 1000"],
    ["System Comparison Table", "Rounding Drills", "HOTS Reasoning"]],
  [2, "Operations on Fractions", ["Fraction Mastery"],
    ["Like & Unlike Fractions", "Equivalent Fractions", "Addition and Subtraction of Like Fractions"],
    ["Simplifying Fractions", "Fill in Missing Numerator", "Real-world Applications"]],
  [3, "Geometry: Angles, Perimeter & Area", ["Measurement & Shapes"],
    ["Types of Angles (Acute, Right, Obtuse)", "Perimeter of Rectangle and Square", "Basic Area on Grids"],
    ["Calculate Perimeter", "Identify Angle Types", "Drawing Exercises"]]
]);

// ----------------- GRADE 5 -----------------
add("Grade 5", "g05", [
  [1, "Numbers up to Crores", ["7 and 8-Digit Numbers"],
    ["Indian vs International system", "Successor & Predecessor", "Roman Numerals to C"],
    ["Conversion Problems", "Evaluation Tests", "High-Order Word Problems"]],
  [2, "Factors, Multiples, HCF & LCM", ["Number Theory Basics"],
    ["Prime & Composite numbers", "Prime factorisation tree", "HCF by division", "LCM by listing & division"],
    ["Find HCF/LCM", "True/False on Divisibility", "Problem Solving Scenarios"]],
  [3, "Decimals & Percentages", ["Fraction-Decimal-Percent Conversion"],
    ["Tenths, hundredths, thousandths", "Adding & subtracting decimals", "Introduction to %"],
    ["Conversion Table", "Decimal Word Problems", "Real-life Shopping Drills"]]
]);

// ----------------- GRADE 6 -----------------
add("Grade 6", "cbse-6", [
  [1, "Knowing Our Numbers", ["Number Sense", "Large Numbers"],
    ["Comparing numbers", "Place value and large numbers", "Estimation and rounding", "Roman numerals"]],
  [2, "Whole Numbers", ["Natural and Whole Numbers"],
    ["Number line", "Properties of whole numbers", "Patterns in whole numbers"]],
  [3, "Playing with Numbers", ["Factors and Multiples", "HCF and LCM"],
    ["Factors and multiples", "Prime and composite numbers", "Divisibility tests", "HCF and LCM"]],
  [4, "Basic Geometrical Ideas", ["Elementary Geometry"],
    ["Points, lines, segments, rays", "Angles and their measure", "Triangles and quadrilaterals", "Introduction to circles"]],
  [5, "Understanding Elementary Shapes", ["Shapes and Solids"],
    ["Measuring line segments", "Types of angles", "Perpendicular lines", "Classifying triangles", "Polygons and 3D shapes", "Nets of solids"]],
  [6, "Integers", ["Positive and Negative Numbers"],
    ["Negative numbers", "Integers on the number line", "Addition of integers", "Subtraction of integers"]],
  [7, "Fractions", ["Proper Improper Mixed Fractions"],
    ["Types of fractions", "Equivalent fractions", "Simplest form", "Comparing fractions", "Addition and subtraction of fractions"]],
  [8, "Decimals", ["Decimal Numbers"],
    ["Tenths and hundredths", "Place value of decimals", "Comparing decimals", "Addition and subtraction"]],
  [9, "Data Handling", ["Charts and Graphs"],
    ["Recording data", "Organising data", "Pictographs", "Bar graphs"]],
  [10, "Mensuration", ["Perimeter and Area Basics"],
    ["Perimeter of shapes", "Area of rectangles", "Area of squares"]],
  [11, "Algebra", ["Introduction to Algebra", "Variables"],
    ["Matchstick patterns", "Variables and constants", "Algebraic expressions", "Simple equations"]],
  [12, "Ratio and Proportion", ["Ratios", "Unitary Method"],
    ["Ratio basics", "Proportion", "Unitary method"]],
  [13, "Symmetry", ["Line Symmetry"],
    ["Line symmetry", "Multiple lines of symmetry", "Reflection and symmetry"]],
  [14, "Practical Geometry", ["Geometric Constructions"],
    ["Drawing a circle", "Constructing perpendiculars", "Constructing angles"]]
]);

// ----------------- GRADE 7 -----------------
add("Grade 7", "cbse-7", [
  [1, "Integers", ["Operations on Integers"],
    ["Multiplication of integers", "Division of integers", "Properties of integer operations", "Word problems"]],
  [2, "Fractions and Decimals", ["Fraction Operations"],
    ["Multiplication of fractions", "Division of fractions", "Multiplication of decimals", "Division of decimals"]],
  [3, "Data Handling", ["Mean Median Mode Basics"],
    ["Collecting and organising data", "Mean, median, mode", "Bar and double bar graphs", "Chance basics"]],
  [4, "Simple Equations", ["Linear Equations Basics"],
    ["Setting up equations", "Solving equations", "Transposing terms", "Word problems"]],
  [5, "Lines and Angles", ["Angle Pairs", "Parallel Lines"],
    ["Complementary and supplementary", "Adjacent and linear pair", "Vertically opposite angles", "Parallel lines and transversal"]],
  [6, "The Triangle and its Properties", ["Triangles", "Pythagoras"],
    ["Medians and altitudes", "Angle sum property", "Exterior angle property", "Isosceles and equilateral", "Pythagoras theorem"]],
  [7, "Comparing Quantities", ["Percentage", "Profit and Loss Basics"],
    ["Equivalent ratios", "Percentage basics", "Fractions and decimals to percent", "Simple interest"]],
  [8, "Rational Numbers", ["Rational Numbers Basics"],
    ["Rational numbers basics", "On the number line", "Operations on rationals", "Properties"]],
  [9, "Perimeter and Area", ["Area of Parallelogram", "Circles"],
    ["Squares and rectangles", "Parallelogram and triangle", "Circumference of circle", "Area of circle", "Unit conversions"]],
  [10, "Algebraic Expressions", ["Expressions and Terms"],
    ["Monomials, binomials, polynomials", "Addition of expressions", "Subtraction of expressions", "Using formulas"]],
  [11, "Exponents and Powers", ["Indices", "Laws of Exponents"],
    ["Exponents basics", "Laws of exponents", "Standard form of large numbers"]],
  [12, "Symmetry", ["Rotational Symmetry"],
    ["Line symmetry review", "Rotational symmetry", "Order of rotational symmetry"]],
  [13, "Visualising Solid Shapes", ["3D Shapes", "Solids"],
    ["Nets of 3D shapes", "Faces, edges, vertices", "Views of 3D objects"]]
]);

// ----------------- GRADE 8 -----------------
add("Grade 8", "cbse-8", [
  [1, "Rational Numbers", ["Properties of Rational Numbers"],
    ["Properties of operations", "Negative of a number", "Reciprocal", "Distributivity"]],
  [2, "Linear Equations in One Variable", ["Solving Linear Equations"],
    ["Variables on both sides", "Reducible to linear form", "Word problems"]],
  [3, "Understanding Quadrilaterals", ["Polygons", "Quadrilaterals"],
    ["Polygons and their types", "Angle sum of polygons", "Parallelogram properties", "Special parallelograms"]],
  [4, "Data Handling", ["Grouped Data", "Pie Charts"],
    ["Grouping data", "Histograms", "Pie charts", "Probability basics"]],
  [5, "Squares and Square Roots", ["Square Roots"],
    ["Properties of square numbers", "Patterns", "Division method for roots", "Estimating roots"]],
  [6, "Cubes and Cube Roots", ["Cube Roots"],
    ["Cubes of numbers", "Patterns in cubes", "Cube roots"]],
  [7, "Comparing Quantities", ["Compound Interest", "Discount"],
    ["Percentage increase and decrease", "Discount and marked price", "Compound interest", "Applications"]],
  [8, "Algebraic Expressions and Identities", ["Identities"],
    ["Monomials to polynomials", "Multiplication of expressions", "Standard identities", "Applying identities"]],
  [9, "Mensuration", ["Surface Area and Volume"],
    ["Area of trapezium", "Area of general quadrilateral", "Surface area of cube and cuboid", "Volume of cube and cuboid"]],
  [10, "Exponents and Powers", ["Negative Exponents"],
    ["Powers with negative exponents", "Laws of exponents", "Standard form"]],
  [11, "Direct and Inverse Proportions", ["Variation"],
    ["Direct proportion", "Inverse proportion", "Time-work and speed-distance applications"]],
  [12, "Factorisation", ["Factoring Expressions"],
    ["Common factors", "Regrouping terms", "Using identities", "Division of expressions"]],
  [13, "Introduction to Graphs", ["Linear Graphs"],
    ["Bar graphs and pie charts", "Line graphs", "Linear graphs and coordinates"]],
  [14, "Playing with Numbers", ["Number Puzzles"],
    ["Numbers in general form", "Digit puzzles", "Divisibility tests"]]
]);

// ----------------- GRADE 9 -----------------
add("Grade 9", "cbse-9", [
  [1, "Number Systems", ["Real Numbers", "Irrational Numbers"],
    ["Rational and irrational numbers", "Decimal expansions", "Operations on real numbers", "Laws of exponents for reals"]],
  [2, "Polynomials", ["Remainder Theorem", "Factorisation"],
    ["Polynomials in one variable", "Zeroes of a polynomial", "Remainder theorem", "Factorisation", "Algebraic identities"]],
  [3, "Coordinate Geometry", ["Analytic Geometry", "Cartesian Plane"],
    ["Cartesian system", "Quadrants and signs", "Plotting points in the plane"]],
  [4, "Linear Equations in Two Variables", ["Graphing Equations"],
    ["Linear equations basics", "Solutions", "Graph of ax + by + c = 0"]],
  [5, "Introduction to Euclid's Geometry", ["Euclidean Geometry"],
    ["Euclid's definitions", "Axioms and postulates", "Fifth postulate and equivalents"]],
  [6, "Lines and Angles", ["Angle Relationships"],
    ["Basic terms", "Pairs of angles", "Parallel lines and transversal", "Angle sum of triangle"]],
  [7, "Triangles", ["Congruence of Triangles"],
    ["Congruence criteria SAS ASA SSS RHS", "Isosceles properties", "Inequalities in a triangle"]],
  [8, "Quadrilaterals", ["Parallelograms", "Midpoint Theorem"],
    ["Angle sum property", "Types of quadrilaterals", "Properties of parallelograms", "Midpoint theorem"]],
  [9, "Circles", ["Circle Theorems", "Chords and Arcs"],
    ["Chords and distances", "Perpendicular from centre", "Equal chords", "Angle subtended by an arc", "Cyclic quadrilaterals"]],
  [10, "Heron's Formula", ["Area of Triangle"],
    ["Heron's formula", "Applications to quadrilaterals"]],
  [11, "Surface Areas and Volumes", ["Cones and Spheres"],
    ["Surface area of cone", "Surface area of sphere", "Volume of cone", "Volume of sphere", "Hemisphere"]],
  [12, "Statistics", ["Histograms", "Frequency Polygons"],
    ["Presentation of data", "Bar graphs and histograms", "Frequency polygons"]]
]);

// ----------------- GRADE 10 -----------------
add("Grade 10", "cbse-10", [
  [1, "Real Numbers", ["Euclid Division", "Fundamental Theorem"],
    ["Euclid's division algorithm", "Fundamental theorem", "Irrationality proofs", "Decimal expansions"]],
  [2, "Polynomials", ["Zeroes of Polynomials"],
    ["Geometrical meaning of zeroes", "Zeroes and coefficients", "Division algorithm"]],
  [3, "Pair of Linear Equations in Two Variables", ["Simultaneous Equations"],
    ["Graphical method", "Substitution method", "Elimination method", "Word problems"]],
  [4, "Quadratic Equations", ["Quadratic Formula", "Discriminant"],
    ["Standard form", "Solution by factorisation", "Quadratic formula", "Nature of roots"]],
  [5, "Arithmetic Progressions", ["AP", "Sequences"],
    ["nth term of an AP", "Sum of first n terms", "AP word problems"]],
  [6, "Triangles", ["Similarity", "Thales Theorem"],
    ["Similar figures", "Basic proportionality theorem", "Similarity criteria AA SSS SAS", "Pythagoras theorem"]],
  [7, "Coordinate Geometry", ["Distance Formula", "Section Formula"],
    ["Distance formula", "Section formula", "Area of a triangle from coordinates"]],
  [8, "Introduction to Trigonometry", ["Trig Ratios", "Trig Identities"],
    ["Trigonometric ratios", "Complementary angles", "Trigonometric identities"]],
  [9, "Some Applications of Trigonometry", ["Heights and Distances"],
    ["Angle of elevation", "Angle of depression", "Heights and distances problems"]],
  [10, "Circles", ["Tangent Properties"],
    ["Tangent to a circle", "Tangents from a point", "Tangent theorems"]],
  [11, "Areas Related to Circles", ["Sector and Segment"],
    ["Circle area review", "Areas of sector and segment", "Combination figures"]],
  [12, "Surface Areas and Volumes", ["Combination of Solids", "Frustum"],
    ["Surface area of combinations", "Volume of combinations", "Conversion of solids", "Frustum of a cone"]],
  [13, "Statistics", ["Grouped Data"],
    ["Mean of grouped data", "Mode of grouped data", "Median of grouped data", "Cumulative frequency graphs"]],
  [14, "Probability", ["Theoretical Probability"],
    ["Probability basics", "Theoretical probability", "Card and dice problems"]]
]);

// ---------- Helpers (Used by Generator, API routes & Topic Pickers) ----------

export function getAtlasGrades(): string[] {
  return Array.from(new Set(ATLAS.map((c) => c.grade)));
}

export function getAtlasChapters(grade: string): AtlasChapter[] {
  return ATLAS.filter((c) => c.grade.toLowerCase() === grade.toLowerCase()).sort(
    (a, b) => a.number - b.number
  );
}

export function searchAtlas(query: string): AtlasChapter[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ATLAS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.aliases.some((a) => a.toLowerCase().includes(q)) ||
      c.subtopics.some((s) => s.toLowerCase().includes(q))
  );
}

export function findAtlasChapter(id: string): AtlasChapter | undefined {
  return ATLAS.find((c) => c.id === id);
}

export function atlasSize(): number {
  return ATLAS.length;
}

export { ATLAS };