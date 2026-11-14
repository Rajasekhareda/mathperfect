/**
 * STRICT RTE / NCERT GRADE-LEVEL PEDAGOGICAL AGENTS (CLASSES 1 - 10)
 * Enforces strict pedagogical boundaries, number ranges, permitted operations,
 * and chapter scopes for CBSE / ICSE / State Board RTE compliance.
 */

export interface GradeAgentContract {
  grade: number;
  gradeLabel: string;
  stage: "Foundational" | "Preparatory" | "Middle" | "Secondary";
  numberBoundaries: string;
  permittedOperations: string[];
  forbiddenConcepts: string[];
  allowedUnits: string[];
  ncertChapters: Record<string, string>;
  systemPromptEnforcer: string;
}

export const GRADE_AGENTS: Record<number, GradeAgentContract> = {
  1: {
    grade: 1,
    gradeLabel: "Class 1 (Grade 1)",
    stage: "Foundational",
    numberBoundaries: "Numbers from 1 to 20 only (extending to 50 for counting). Single-digit addition/subtraction where sum <= 20. NO NEGATIVE NUMBERS.",
    permittedOperations: [
      "Counting and grouping concrete objects (1-20)",
      "Single-digit addition (sums <= 20)",
      "Single-digit subtraction (no borrowing, minuend >= subtrahend, result >= 0)",
      "Basic 2D shapes: Circle, Square, Triangle, Rectangle",
      "Comparison: Bigger/Smaller, Taller/Shorter, More/Less",
      "Simple patterns of shapes and numbers"
    ],
    forbiddenConcepts: [
      "Multiplication", "Division", "Fractions", "Decimals", "Negative numbers",
      "2-digit multiplication", "Place value beyond Tens", "Word problems with more than 1 operation"
    ],
    allowedUnits: ["Rupees (coins 1, 2, 5, 10)", "Pencils", "Apples", "Balls", "Books"],
    ncertChapters: {
      "Shapes and Space": "Spatial understanding (Inside/Outside, Bigger/Smaller, Top/Bottom), sorting basic shapes.",
      "Numbers from One to Nine": "Counting, reading, writing numerals and number names up to 9.",
      "Addition": "Combining collections, simple single-digit addition with visual/concrete scenarios.",
      "Subtraction": "Taking away, single-digit subtraction with visual context (minuend <= 9).",
      "Numbers from Ten to Twenty": "Grouping into tens and ones, counting forward/backward up to 20.",
      "Time": "Earlier/Later, morning/afternoon/night sequences, days of the week.",
      "Measurement": "Longer/Shorter, Tallest/Shortest, Heavier/Lighter using non-standard units (handspan, foot).",
      "Numbers from Twenty-one to Fifty": "Counting and writing numerals 21 to 50.",
      "Data Handling": "Counting occurrences of items from a picture list.",
      "Patterns": "Extending alternating sequences (e.g., Triangle, Circle, Triangle, ...).",
      "Numbers up to 100": "Basic counting up to 100.",
      "Money": "Identifying Indian currency notes and coins (Rs 1, 2, 5, 10, 20)."
    },
    systemPromptEnforcer: `You are the Class 1 (Foundational Stage) Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 1 syllabus.
STRICT RULES FOR CLASS 1:
- Number range: strictly 1 to 20. Sums cannot exceed 20. Subtractions must yield non-negative single-digit results.
- Language must be simple, concrete, and child-friendly (e.g., 'Ravi has 4 mangoes. He eats 2. How many mangoes are left?').
- NEVER use algebraic variables, multiplication, division, fractions, or negative numbers.`
  },

  2: {
    grade: 2,
    gradeLabel: "Class 2 (Grade 2)",
    stage: "Foundational",
    numberBoundaries: "Numbers up to 99 (2-digit numbers). Addition and subtraction up to 99. Sums must not exceed 100.",
    permittedOperations: [
      "2-digit addition (with and without regrouping/carry-over)",
      "2-digit subtraction (with and without borrowing, result >= 0)",
      "Skip counting by 2, 5, and 10",
      "Basic repeated addition (concept of multiplication as repeated addition up to 5x5)",
      "Standard and non-standard measurement (handspan, ruler in cm)",
      "2D and basic 3D shapes (Cube, Sphere, Cylinder, Cone identification)"
    ],
    forbiddenConcepts: [
      "Long division", "Fractions", "Decimals", "Negative numbers", "Numbers >= 1000",
      "Multiplication tables above 10", "Algebra"
    ],
    allowedUnits: ["Rupees (₹)", "Centimetres (cm)", "Litres (simple concept)", "Days and Months"],
    ncertChapters: {
      "What is Long, What is Round": "Rolling vs sliding objects, properties of round and flat surfaces.",
      "Counting in Groups": "Grouping objects in 2s, 5s, 10s, counting and estimation.",
      "How Much Can You Carry": "Concept of weight, heavier vs lighter, balances.",
      "Counting in Tens": "Place value understanding of Tens and Ones up to 99.",
      "Patterns": "Number patterns (skip counting by 2, 5, 10) and geometrical patterns.",
      "Footprints": "Identifying 2D faces of 3D objects, tracing shapes.",
      "Jugs and Mugs": "Capacity comparison (more capacity vs less capacity).",
      "Tens and Ones": "Splitting 2-digit numbers into tens and ones (e.g. 43 = 40 + 3).",
      "My Funday": "Days of the week, months of the year, daily routine time.",
      "Add Our Points": "2-digit addition and subtraction, simple mental arithmetic.",
      "Lines and Lines": "Standing, slanting, and sleeping lines, curved lines.",
      "Give and Take": "Word problems on 2-digit addition and subtraction with real-life context (money, shopping).",
      "How Many Ponytails": "Collecting data, tally marks, simple pictographs."
    },
    systemPromptEnforcer: `You are the Class 2 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 2 syllabus.
STRICT RULES FOR CLASS 2:
- Numbers strictly between 1 and 99. Max sum <= 100. Minuend must be strictly greater than subtrahend.
- Simple word problems involving daily activities (shopping, fruit stalls, toy cars).
- NEVER use long division, fractions, decimal notation, or formal algebra.`
  },

  3: {
    grade: 3,
    gradeLabel: "Class 3 (Grade 3)",
    stage: "Preparatory",
    numberBoundaries: "Numbers up to 999 (3-digit numbers). Addition and subtraction up to 3 digits. Multiplication of 2-digit by 1-digit numbers. Division with single-digit divisors (no remainder or simple remainders).",
    permittedOperations: [
      "3-digit addition and subtraction with carry/borrow",
      "Multiplication tables up to 10",
      "Multiplication of 2-digit by 1-digit numbers",
      "Concept of sharing and grouping (division as equal sharing)",
      "Simple fractions: 1/2, 1/3, 1/4 of collections or shapes",
      "Reading clock to the nearest 5 minutes",
      "Currency calculations (addition and subtraction of Rupees and Paise)"
    ],
    forbiddenConcepts: [
      "Decimals", "Negative numbers", "Percentages", "Variables (x, y)",
      "Area/Volume formulas", "Multiplication of 3-digit by 2-digit numbers"
    ],
    allowedUnits: ["Metres (m)", "Centimetres (cm)", "Kilograms (kg)", "Grams (g)", "Litres (L)", "Millilitres (mL)", "Rupees (₹)", "Paise (p)"],
    ncertChapters: {
      "Where to Look From": "Top view, front view, side view, symmetry along mirror lines.",
      "Fun with Numbers": "3-digit numbers, place value (Hundreds, Tens, Ones), expanded form, skip counting by 50 and 100.",
      "Give and Take": "Mental addition, 3-digit addition with regrouping, word problems on additions.",
      "Long and Short": "Standard length measurement (cm and m), ruler usage, conversion 1 m = 100 cm.",
      "Shapes and Designs": "Edges and corners of 2D/3D shapes, tangrams, tessellation and tiling patterns.",
      "Fun with Give and Take": "3-digit subtraction with borrowing, checking subtraction using addition.",
      "Time Goes On": "Reading calendar, reading clock, calculating elapsed time in hours.",
      "Who is Heavier": "Weight comparison, balancing scales, standard weights in kg and g (1 kg = 1000 g).",
      "How Many Times": "Multiplication as repeated addition, arrays, multiplying 2-digit by 1-digit numbers.",
      "Play with Patterns": "Even and odd number patterns, symmetric designs, alphabetical patterns.",
      "Jugs and Mugs": "Capacity in Litres and Millilitres (1 L = 1000 mL), simple addition of capacities.",
      "Can We Share": "Equal distribution, division concept (dividend <= 100, divisor <= 10).",
      "Smart Charts": "Pictographs, tally marks, basic bar charts.",
      "Rupees and Paise": "Adding and subtracting money amounts, making simple shopping bills."
    },
    systemPromptEnforcer: `You are the Class 3 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 3 syllabus.
STRICT RULES FOR CLASS 3:
- Numbers strictly up to 999. Multiplication restricted to 2-digit by 1-digit numbers (e.g., 34 x 6).
- Division restricted to single-digit divisors (e.g., 48 ÷ 4).
- Unit conversions allowed: 1 m = 100 cm, 1 kg = 1000 g, 1 L = 1000 mL, ₹1 = 100 paise.
- NEVER use decimal points, percentages, or algebraic variables.`
  },

  4: {
    grade: 4,
    gradeLabel: "Class 4 (Grade 4)",
    stage: "Preparatory",
    numberBoundaries: "Numbers up to 10,000 (4-digit and 5-digit numbers). Operations with 4-digit numbers. Multiplication of 2-digit by 2-digit or 3-digit by 1-digit. Division of 3-digit numbers by 1-digit divisor.",
    permittedOperations: [
      "4-digit addition and subtraction",
      "Multiplication (3-digit by 1-digit, 2-digit by 2-digit)",
      "Long division by 1-digit divisor with quotient and remainder",
      "Fraction understanding (halves, quarters, three-quarters, shaded regions)",
      "Perimeter of simple polygons (sum of all sides)",
      "Time: 12-hour and 24-hour clock conversions",
      "Basic angles: Acute, Right, Obtuse identification"
    ],
    forbiddenConcepts: [
      "Complex decimal arithmetic", "Algebraic equations", "Negative integers",
      "Exponentiation", "Pythagoras theorem", "Percentages", "Ratio and proportion"
    ],
    allowedUnits: ["km", "m", "cm", "mm", "kg", "g", "L", "mL", "₹", "p", "Hours", "Minutes", "Seconds"],
    ncertChapters: {
      "Building with Bricks": "Floor patterns, brick dimensions, drawing 3D views, arches.",
      "Long and Short": "Distance estimation, conversion between km, m, and cm.",
      "A Trip to Bhopal": "Real-life multi-step arithmetic word problems (ticket pricing, distance, time schedules).",
      "Tick-Tick-Tick": "Clock reading, AM/PM, 24-hour clock, timeline problems.",
      "The Way The World Looks": "Top, side, and isometric views of objects and houses.",
      "The Junk Seller": "Money calculations, profit/loss intuition, interest concept as simple markup, estimating products.",
      "Jugs and Mugs": "Liquid measurement and volume word problems (L and mL).",
      "Carts and Wheels": "Circle geometry: centre, radius, diameter (diameter = 2 x radius), compass drawing.",
      "Halves and Quarters": "Fractions: 1/2, 1/4, 3/4, equivalent visual fractions, fractional parts of a whole.",
      "Play with Patterns": "Number puzzles, magic squares (3x3), coding messages, repeating block patterns.",
      "Tables and Shares": "Multiplication and division facts, word problems on grouping and equal distribution.",
      "How Heavy? How Light?": "Weight conversions and balances, postal rates, multi-step weight problems.",
      "Fields and Fences": "Perimeter of rectangles, squares, and irregular polygons by adding side lengths.",
      "Smart Charts": "Interpreting bar charts and chapati charts (pie charts with halves/quarters)."
    },
    systemPromptEnforcer: `You are the Class 4 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 4 syllabus.
STRICT RULES FOR CLASS 4:
- Numbers up to 10,000. Multiplications up to 2-digit x 2-digit or 3-digit x 1-digit.
- Perimeter is strictly sum of side lengths. Circle questions focus on Radius and Diameter (D = 2r).
- Fractions are proper fractions (halves, thirds, quarters). NO algebraic variables.`
  },

  5: {
    grade: 5,
    gradeLabel: "Class 5 (Grade 5)",
    stage: "Preparatory",
    numberBoundaries: "Numbers up to 1,00,00,000 (Indian system: Lakhs and Crores) and Millions (International system). Multiplications of 3-digit by 2-digit numbers. Long division by 2-digit numbers.",
    permittedOperations: [
      "Large numbers place value, reading, writing, and comparing",
      "Area and Perimeter of rectangles and squares (Area = length x breadth)",
      "Angles: Measurement using protractor, degrees, acute/right/obtuse/straight",
      "Fractions: Like and unlike fractions, addition/subtraction, mixed numbers",
      "Decimals: Tenths, hundredths, thousandths, converting between fractions and decimals",
      "Volume of cubes and cuboids (intuitive volume = count unit cubes)",
      "Factors and Multiples: Common factors, common multiples, HCF and LCM introduction"
    ],
    forbiddenConcepts: [
      "Negative integers", "Algebraic expressions (variables x, y)", "Trigonometry",
      "Polynomials", "Pythagoras theorem", "Quadratic equations"
    ],
    allowedUnits: ["sq cm", "sq m", "cubic cm", "km", "m", "cm", "kg", "g", "L", "mL", "Degrees (°)"],
    ncertChapters: {
      "The Fish Tale": "Large numbers up to Crores, speed-distance-time word problems, loan and bank calculations.",
      "Shapes and Angles": "Angle types (right, less than right, more than right), angles in names, clock hands.",
      "How Many Squares": "Area and perimeter of irregular shapes on squared grid, perimeter and area of rectangles.",
      "Parts and Wholes": "Fraction representation, equivalent fractions, adding simple fractions, word problems.",
      "Does it Look the Same": "Rotational symmetry (1/2 turn, 1/3 turn, 1/4 turn, 1/6 turn), reflection symmetry.",
      "Be My Multiple, I'll be Your Factor": "Multiples, factors, common factors, LCM, HCF, factor trees.",
      "Can You See the Pattern": "Number patterns, palindromes, calendar magic tricks, rotation of patterns.",
      "Mapping Your Way": "Scale drawings on maps, reading directions, ratio grids.",
      "Boxes and Sketches": "Nets of cubes, cuboids, 2D representations of 3D objects, floor plans.",
      "Tenths and Hundredths": "Decimal notation (e.g. 1.25 m), temperature tables, currency in decimals.",
      "Area and its Boundary": "Formal formulas: Area of rectangle = L x B, Area of square = S x S; Perimeter = 2(L + B).",
      "Smart Charts": "Bar graphs, tally charts, temperature graphs, frequency tables.",
      "Ways to Multiply and Divide": "Standard algorithms for multi-digit multiplication and long division.",
      "How Big? How Heavy?": "Volume of cuboids (L x B x H), displacement of water method for irregular solids."
    },
    systemPromptEnforcer: `You are the Class 5 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 5 syllabus.
STRICT RULES FOR CLASS 5:
- Area of rectangle = l × w; Area of square = side × side. Perimeter = 2(l + w).
- Decimals up to 2 decimal places (hundredths). Fractions: proper, improper, mixed.
- Factors and Multiples: factor tree, HCF, LCM.
- NO algebra, negative numbers, or coordinate geometry.`
  },

  6: {
    grade: 6,
    gradeLabel: "Class 6 (Grade 6)",
    stage: "Middle",
    numberBoundaries: "Integers (positive and negative), Whole numbers, Prime/Composite up to 100, Fractions, Decimals.",
    permittedOperations: [
      "Integers: Number line, absolute value, addition and subtraction of integers",
      "Fractions and Decimals operations (add, subtract, multiply)",
      "Introduction to Algebra: Variables as unknowns, forming algebraic expressions (e.g. 2x + 3)",
      "Ratio and Proportion: Concept of ratio (a:b), unit method",
      "Basic Geometrical Ideas: Point, line, ray, segment, intersecting and parallel lines, polygons, triangles, quadrilaterals, circles (chord, radius, diameter, arc, sector)",
      "Mensuration: Perimeter and Area of rectangles, squares",
      "Symmetry: Lines of symmetry for geometric figures",
      "Data Handling: Bar graphs and tally tables"
    ],
    forbiddenConcepts: [
      "Quadratic equations", "Simultaneous linear equations", "Trigonometry",
      "Pythagoras theorem", "Exponents/Powers laws (formal)", "Irrational numbers"
    ],
    allowedUnits: ["sq m", "sq cm", "hectare", "kg", "g", "km", "m", "cm", "mm"],
    ncertChapters: {
      "Knowing Our Numbers": "Large numbers up to 8 digits, Roman numerals, rounding off/estimation, brackets.",
      "Whole Numbers": "Properties of whole numbers (closure, commutative, associative, distributive), number line.",
      "Playing with Numbers": "Divisibility tests (2, 3, 4, 5, 6, 8, 9, 10, 11), prime factorization, HCF and LCM.",
      "Basic Geometrical Ideas": "Points, lines, rays, segments, angles, triangles, quadrilaterals, circle elements.",
      "Understanding Elementary Shapes": "Classifying triangles (by sides and angles), quadrilaterals, 3D shapes (faces, edges, vertices).",
      "Integers": "Representation on number line, ordering, addition and subtraction of positive and negative integers.",
      "Fractions": "Proper, improper, mixed, equivalent fractions, simplest form, comparing, addition/subtraction.",
      "Decimals": "Place value chart (tenths, hundredths, thousandths), conversion, money/length word problems.",
      "Data Handling": "Organizing data, pictographs, drawing and interpreting bar graphs.",
      "Mensuration": "Perimeter formulas, area of rectangle and square, word problems on tiling and fencing.",
      "Algebra": "Introduction to variables, matchstick patterns, linear expressions, solving simple one-step equations.",
      "Ratio and Proportion": "Simplest ratio form, checking proportion (a:b = c:d), unitary method.",
      "Symmetry": "Line symmetry, reflections, symmetric shapes.",
      "Practical Geometry": "Construction of circle, line segment perpendicular bisector, angles (60°, 90°, 120°) with ruler/compass."
    },
    systemPromptEnforcer: `You are the Class 6 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 6 syllabus.
STRICT RULES FOR CLASS 6:
- Integers: must handle positive and negative signs accurately.
- Algebra is strictly introductory: 1-step linear equations (e.g., x + 5 = 12, 3y = 15).
- Ratio: a:b and Unitary method.
- Mensuration: Perimeter and Area of Rectangles/Squares only. NO circular area (pi is not yet introduced).`
  },

  7: {
    grade: 7,
    gradeLabel: "Class 7 (Grade 7)",
    stage: "Middle",
    numberBoundaries: "Rational numbers, Integers multiplication and division, Exponents and powers (laws of exponents).",
    permittedOperations: [
      "Integers: Multiplication and division rules with signs",
      "Fractions and Decimals: Multiplication and division",
      "Rational Numbers: Representation, equivalent, operations (+, -, *, /)",
      "Simple Linear Equations in one variable (e.g., 3x + 5 = 20)",
      "Lines and Angles: Complementary, supplementary, vertically opposite, alternate interior, corresponding angles",
      "The Triangle and its Properties: Angle sum property (180°), exterior angle theorem, Pythagoras theorem",
      "Congruence of Triangles: SSS, SAS, ASA, RHS criteria",
      "Comparing Quantities: Percentage, Profit and Loss, Simple Interest (I = PRT / 100)",
      "Perimeter and Area: Area of parallelogram (b x h), triangle (1/2 x b x h), circle circumference (2πr) and area (πr²)",
      "Algebraic Expressions: Monomials, binomials, trinomials, addition/subtraction of like terms"
    ],
    forbiddenConcepts: [
      "Quadratic equations", "Trigonometric ratios", "Polynomial division",
      "Linear equations in two variables", "Compound Interest", "Coordinate geometry"
    ],
    allowedUnits: ["sq units", "cm²", "m²", "km²", "₹", "°C", "%"],
    ncertChapters: {
      "Integers": "Properties of integer multiplication and division, distributive property over addition.",
      "Fractions and Decimals": "Multiplication and division of fractions and decimals, reciprocal of fractions.",
      "Data Handling": "Mean, Median, Mode of ungrouped data, range, double bar graphs, probability concept.",
      "Simple Equations": "Setting up and solving linear equations in one variable with transposition.",
      "Lines and Angles": "Transversal intersecting parallel lines, angle pairs.",
      "The Triangle and Its Properties": "Medians, altitudes, exterior angle property, angle sum property, Pythagoras property.",
      "Congruence of Triangles": "Congruence criteria: SSS, SAS, ASA, RHS with rigorous notation.",
      "Comparing Quantities": "Ratios to percentages, increase/decrease percentage, cost price, selling price, profit/loss %, Simple Interest (SI = P*R*T/100).",
      "Rational Numbers": "Positive and negative rationals, standard form, comparison, operations.",
      "Practical Geometry": "Construction of parallel lines and triangles given SSS, SAS, ASA, RHS.",
      "Perimeter and Area": "Area of parallelogram, triangle, circumference and area of circle (using π = 22/7), applications.",
      "Algebraic Expressions": "Terms, coefficients, like/unlike terms, addition/subtraction, finding values of expressions for given variable value.",
      "Exponents and Powers": "Laws of exponents: a^m * a^n = a^(m+n), a^m / a^n = a^(m-n), (a^m)^n = a^(mn), scientific notation.",
      "Symmetry": "Rotational symmetry (order and angle of rotation), line and rotational symmetry combined.",
      "Visualising Solid Shapes": "Euler's formula (V - E + F = 2 for polyhedra), nets of solids, oblique/isometric sketches."
    },
    systemPromptEnforcer: `You are the Class 7 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 7 syllabus.
STRICT RULES FOR CLASS 7:
- Formula enforcement: Simple Interest (SI = PRT/100). Circle Area = πr², Circumference = 2πr (use π = 22/7 or 3.14).
- Triangle Angle Sum = 180°, Pythagoras Theorem for right-angled triangles: Hypotenuse² = Base² + Perpendicular².
- Rational numbers must be in p/q form (q ≠ 0).
- NO quadratic equations, compound interest, or trigonometry.`
  },

  8: {
    grade: 8,
    gradeLabel: "Class 8 (Grade 8)",
    stage: "Middle",
    numberBoundaries: "Rational numbers, Powers and Exponents with negative exponents, Square roots and Cube roots.",
    permittedOperations: [
      "Rational Numbers properties",
      "Linear Equations in One Variable (variable on both sides, cross-multiplication)",
      "Understanding Quadrilaterals: Properties of Parallelogram, Rhombus, Rectangle, Square, Trapezium",
      "Square and Square Roots (prime factorization, long division method), Cube and Cube Roots",
      "Comparing Quantities: Compound Interest formula A = P(1 + r/100)^n, Discount, Sales Tax / GST",
      "Algebraic Expressions and Identities: (a+b)², (a-b)², (a²-b²), (x+a)(x+b)",
      "Factorisation: Common factors, regrouping, using algebraic identities, splitting middle term of quadratic trinomials",
      "Mensuration: Surface area and Volume of Cube, Cuboid, and Cylinder",
      "Direct and Inverse Proportions",
      "Introduction to Graphs: Cartesian coordinates (x, y), linear graphs"
    ],
    forbiddenConcepts: [
      "Trigonometry", "Quadratic formula / discriminant", "AP / GP progressions",
      "Formal coordinate geometry formulas (distance, section)", "Surface area of Cone/Sphere"
    ],
    allowedUnits: ["cm³", "m³", "L", "mL", "₹", "%", "sq cm", "sq m"],
    ncertChapters: {
      "Rational Numbers": "Closure, commutativity, associativity, identity, inverse, representation on number line, inserting rational numbers.",
      "Linear Equations in One Variable": "Equations with linear expressions on one side and numbers on other, variables on both sides, word problems (age, currency, digits).",
      "Understanding Quadrilaterals": "Polygon angle sum theorem [(n-2)*180°], exterior angle sum = 360°, classification of quadrilaterals.",
      "Data Handling": "Histograms, pie charts (sector angles = value/total * 360°), basic probability.",
      "Squares and Square Roots": "Properties of square numbers, Pythagorean triplets, finding roots by division and factorisation.",
      "Cubes and Cube Roots": "Properties, finding cube root by prime factorisation.",
      "Comparing Quantities": "Discounts, Profit & Loss with GST, Compound Interest compounded annually and half-yearly.",
      "Algebraic Expressions and Identities": "Standard algebraic identities and their numerical applications.",
      "Mensuration": "Area of trapezium = 1/2(a+b)h, area of general quadrilateral, surface area and volume of cube, cuboid, right circular cylinder.",
      "Exponents and Powers": "Negative exponents (a^-m = 1/a^m), standard scientific form for very small/large numbers.",
      "Direct and Inverse Proportions": "Direct (x/y = k) vs Inverse (xy = k) variations and real-world word problems.",
      "Factorisation": "Factorisation of expressions, division of polynomials by monomial and binomial.",
      "Introduction to Graphs": "Plotting points on Cartesian plane, interpreting line graphs and distance-time graphs."
    },
    systemPromptEnforcer: `You are the Class 8 Mathematics Pedagogy Agent strictly aligned with NCERT/RTE Class 8 syllabus.
STRICT RULES FOR CLASS 8:
- Compound Interest: A = P(1 + r/100)^n, CI = A - P.
- Surface Area & Volume of Cylinder: Curved SA = 2πrh, Total SA = 2πr(r+h), Volume = πr²h.
- Identities: (a+b)² = a² + 2ab + b², (a-b)² = a² - 2ab + b², a² - b² = (a-b)(a+b).
- NO quadratic formula, trigonometry, or cone/sphere geometry.`
  },

  9: {
    grade: 9,
    gradeLabel: "Class 9 (Grade 9)",
    stage: "Secondary",
    numberBoundaries: "Real numbers (Rational and Irrational numbers), Representation on number line, Rationalising denominators.",
    permittedOperations: [
      "Number Systems: Irrational numbers (√2, √3), laws of rational exponents, rationalising 1/(a + √b)",
      "Polynomials: Zeros of polynomial, Remainder and Factor theorems, factorising cubic polynomials, algebraic identities",
      "Coordinate Geometry: Cartesian plane, coordinates of points, quadrants",
      "Linear Equations in Two Variables: ax + by + c = 0, graphing, finding solutions",
      "Lines and Angles: Transversal theorems, angle sum of triangle",
      "Triangles: Congruence proofs (SAS, ASA, AAS, SSS, RHS), inequalities in a triangle",
      "Quadrilaterals: Mid-point theorem and its converse, properties of parallelograms proofs",
      "Circles: Chords, angle subtended by an arc at centre is double the angle on circle, cyclic quadrilaterals",
      "Heron's Formula: Area of triangle = √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2",
      "Surface Areas and Volumes: Cubes, Cuboids, Cylinders, Right Circular Cones, Spheres, Hemispheres",
      "Statistics: Grouped data, frequency polygons, mean, median, mode of grouped data"
    ],
    forbiddenConcepts: [
      "Trigonometry", "Arithmetic Progressions", "Quadratic formula for roots",
      "Coordinate geometry distance / section formulas", "Calculus"
    ],
    allowedUnits: ["cm³", "m³", "litres", "sq cm", "sq m", "units"],
    ncertChapters: {
      "Number Systems": "Real numbers, terminating/non-terminating recurring decimals, rationalising the denominator.",
      "Polynomials": "Degree of polynomial, Remainder Theorem, Factor Theorem, identities: (x+y+z)², (x±y)³, x³+y³+z³-3xyz.",
      "Coordinate Geometry": "Cartesian system, plotting points, reading coordinates from quadrants.",
      "Linear Equations in Two Variables": "Solutions of linear equation, plotting straight lines, parallel lines to axes.",
      "Introduction to Euclid's Geometry": "Euclid's axioms and 5 postulates.",
      "Lines and Angles": "Proofs of vertically opposite angles, parallel lines and transversals, angle sum theorem.",
      "Triangles": "Rigorous congruence proofs, properties of isosceles triangles.",
      "Quadrilaterals": "Parallelogram theorem proofs, Mid-point theorem.",
      "Circles": "Equal chords equidistant from centre, angle in a semicircle is right angle, cyclic quadrilateral opposite angles sum to 180°.",
      "Heron's Formula": "Area of scalene triangles, applications to finding quadrilateral areas.",
      "Surface Areas and Volumes": "Cone: CSA = πrl, TSA = πr(r+l), Vol = 1/3 πr²h. Sphere: SA = 4πr², Vol = 4/3 πr³. Hemisphere: CSA = 2πr², TSA = 3πr², Vol = 2/3 πr³.",
      "Statistics": "Bar graphs, histograms (with varying base lengths), frequency polygons."
    },
    systemPromptEnforcer: `You are the Class 9 Mathematics Pedagogy Agent strictly aligned with NCERT/CBSE Class 9 syllabus.
STRICT RULES FOR CLASS 9:
- Heron's Formula: s = (a+b+c)/2; Area = √(s(s-a)(s-b)(s-c)).
- Cones & Spheres: Cone slant height l = √(r² + h²); Volume = 1/3 πr²h. Sphere Volume = 4/3 πr³, SA = 4πr².
- Factor Theorem for polynomials. Rationalising denominators using conjugates.
- NO Trigonometry, Arithmetic Progressions, or Quadratic Formula.`
  },

  10: {
    grade: 10,
    gradeLabel: "Class 10 (Grade 10)",
    stage: "Secondary",
    numberBoundaries: "Real numbers, Irrationality proofs, Fundamental Theorem of Arithmetic (HCF x LCM = Product of numbers).",
    permittedOperations: [
      "Real Numbers: Fundamental Theorem of Arithmetic, proving irrationality (e.g. prove √5 is irrational)",
      "Polynomials: Zeros and coefficients relationship for quadratic and cubic polynomials (α + β = -b/a, αβ = c/a)",
      "Pair of Linear Equations in Two Variables: Graphical method, Substitution, Elimination, consistency conditions (a1/a2)",
      "Quadratic Equations: ax² + bx + c = 0, Factorisation, Quadratic Formula x = (-b ± √D)/(2a), Discriminant D = b² - 4ac",
      "Arithmetic Progressions (AP): nth term an = a + (n-1)d, Sum of first n terms Sn = n/2 [2a + (n-1)d]",
      "Triangles: Thales' Basic Proportionality Theorem (BPT) and its converse, similarity criteria (AAA, SSS, SAS)",
      "Coordinate Geometry: Distance formula, Section formula [ (mx2+nx1)/(m+n), (my2+ny1)/(m+n) ], Area of triangle",
      "Introduction to Trigonometry: sin, cos, tan, cosec, sec, cot, specific angles (0°, 30°, 45°, 60°, 90°), identities: sin²θ + cos²θ = 1",
      "Some Applications of Trigonometry: Heights and Distances, angle of elevation and depression (single and double triangle)",
      "Circles: Tangent to a circle theorem (radius is perpendicular to tangent), lengths of tangents from external point are equal",
      "Areas Related to Circles: Area of sector = (θ/360) * πr², length of arc = (θ/360) * 2πr, area of segment",
      "Surface Areas and Volumes: Combination of solids (cylinder + hemisphere, cone on hemisphere, etc.), conversion of solids",
      "Statistics: Mean by Direct, Assumed Mean, Step-deviation; Mode and Median of grouped data",
      "Probability: Classical probability P(E) = favourable outcomes / total outcomes"
    ],
    forbiddenConcepts: [
      "Calculus (differentiation / integration)", "Vectors", "Matrices",
      "3D Coordinate geometry with z-axis", "Complex numbers"
    ],
    allowedUnits: ["cm²", "m²", "cm³", "m³", "units", "degrees (°)"],
    ncertChapters: {
      "Real Numbers": "Fundamental Theorem of Arithmetic, irrationality proofs of √2, √3, √5.",
      "Polynomials": "Geometrical meaning of zeros, relationship between zeros and coefficients of quadratic polynomials.",
      "Pair of Linear Equations in Two Variables": "Graphical and algebraic solutions (Substitution, Elimination), word problems on ages, speed-distance, fractions.",
      "Quadratic Equations": "Standard form, roots by factorisation and quadratic formula, nature of roots (D > 0, D = 0, D < 0).",
      "Arithmetic Progressions": "Finding nth term, sum of n terms, real-world application problems.",
      "Triangles": "Basic Proportionality Theorem (BPT), criteria for similarity of triangles, rigorous proofs.",
      "Coordinate Geometry": "Distance formula, section formula, midpoint formula, collinearity of three points.",
      "Introduction to Trigonometry": "Trigonometric ratios of acute angles, values at 0°, 30°, 45°, 60°, 90°, trigonometric identities.",
      "Some Applications of Trigonometry": "Heights and Distances word problems (angles of elevation and depression, 30°, 45°, 60°).",
      "Circles": "Tangents to circles, properties of external tangents, proofs and numerical problems.",
      "Areas Related to Circles": "Area of sectors and segments of circles (central angle 60°, 90°, 120°).",
      "Surface Areas and Volumes": "Surface area and volume of combinations of solids (cubes, cuboids, spheres, hemispheres, cones, cylinders).",
      "Statistics": "Mean, median, and mode of grouped frequency distributions, empirical relationship: Mode = 3 Median - 2 Mean.",
      "Probability": "Single-event classical probability, deck of cards, coins, dice, marbles."
    },
    systemPromptEnforcer: `You are the Class 10 Mathematics Pedagogy Agent strictly aligned with NCERT/CBSE Class 10 Board exam syllabus.
STRICT RULES FOR CLASS 10:
- Quadratic Equations: use Discriminant D = b² - 4ac and roots x = (-b ± √D)/(2a).
- Trigonometry: restricted to standard angles (0°, 30°, 45°, 60°, 90°) and fundamental identities (sin²θ + cos²θ = 1).
- AP: an = a + (n-1)d; Sn = n/2 [2a + (n-1)d].
- Require exact step-by-step working and correct algebraic notation in answers.`
  }
};

/**
 * Returns the strict system prompt and constraints for any requested grade.
 * Falls back safely to Grade 5 preparatory standards if an invalid grade is supplied.
 */
export function getGradePedagogicalAgent(gradeInput: number | string): GradeAgentContract {
  const g = typeof gradeInput === "string" ? parseInt(gradeInput.replace(/\D/g, ""), 10) : gradeInput;
  return GRADE_AGENTS[g] || GRADE_AGENTS[5];
}

/**
 * Formats a comprehensive system prompt injected into the LLM call,
 * making it impossible for the model to hallucinate or generate out-of-syllabus pseudo questions.
 */
export function buildGradeSystemPrompt(gradeInput: number | string, chapterTopic?: string): string {
  const agent = getGradePedagogicalAgent(gradeInput);
  
  let chapterContext = "";
  if (chapterTopic && agent.ncertChapters[chapterTopic]) {
    chapterContext = `\nSELECTED NCERT/RTE CHAPTER: "${chapterTopic}"\nCHAPTER PEDAGOGY: ${agent.ncertChapters[chapterTopic]}\n`;
  } else if (chapterTopic) {
    chapterContext = `\nSELECTED TOPIC: "${chapterTopic}" (Must strictly respect ${agent.gradeLabel} boundaries below)\n`;
  }

  return `${agent.systemPromptEnforcer}

GRADE LEVEL: ${agent.gradeLabel} (${agent.stage} Stage)
NUMBER BOUNDARIES: ${agent.numberBoundaries}
PERMITTED OPERATIONS & CONCEPTS:
- ${agent.permittedOperations.join("\n- ")}

FORBIDDEN CONCEPTS (NEVER USE):
- ${agent.forbiddenConcepts.join("\n- ")}
${chapterContext}
OUTPUT CONTRACT:
1. Every generated question MUST be solvable by a student in ${agent.gradeLabel} using ONLY permitted concepts.
2. Provide exact numbers, realistic Indian currency/unit contexts where applicable.
3. Every question must have an unambiguous, mathematically verified correct answer and step-by-step solution.
4. Reply with ONLY the valid JSON object requested. No conversational filler or markdown fences outside the JSON.`;
}