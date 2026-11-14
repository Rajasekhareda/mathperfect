"""
Global Curriculum Engine and Multi-Grade Chapter Database
Provides complete math chapters, subtopics, and varieties of question types
across all grades (KG to Intermediate 2nd Year / Class 12).
Supports JSON export/import and offline question generation templates.
"""

import json
import os
import sys

GLOBAL_MATH_CURRICULUM = {
    "KG": [
        {
            "chapter": "Pre-Math Basics & Sorting",
            "aliases": ["Early Math", "Classification"],
            "subtopics": ["Big and Small", "Tall and Short", "Heavy and Light", "Sorting by Color"],
            "question_varieties": ["Visual Choice", "Match Pairs", "Circle the Biggest", "Pattern Completion"]
        },
        {
            "chapter": "Numbers 1 to 10",
            "aliases": ["Number Sense", "Counting"],
            "subtopics": ["Counting Objects", "Number Recognition", "Forward Counting", "Tracing Numbers"],
            "question_varieties": ["Count and Write", "Match Number to Dots", "Missing Number", "True or False"]
        }
    ],
    "Class 1": [
        {
            "chapter": "Numbers up to 100",
            "aliases": ["Two-Digit Numbers", "Place Value 10s"],
            "subtopics": ["Tens and Ones", "Number Names", "Before, After, Between", "Comparing Numbers (<, >, =)"],
            "question_varieties": ["Fill in the Blanks", "Multiple Choice", "Expanded Form", "Ascending Order"]
        },
        {
            "chapter": "Addition & Subtraction (Within 20)",
            "aliases": ["Basic Operations", "Sum and Difference"],
            "subtopics": ["Number Line Addition", "Addition on Fingers", "Word Problems", "Subtraction by Crossing Out"],
            "question_varieties": ["Horizontal Calculation", "Vertical Grid", "Story Problems", "Fact Families"]
        },
        {
            "chapter": "Shapes & Space",
            "aliases": ["Geometry Intro", "2D Shapes"],
            "subtopics": ["Circle, Triangle, Square, Rectangle", "Roll and Slide", "Inside and Outside"],
            "question_varieties": ["Identify Shapes", "Draw and Color", "Counting Edges and Corners"]
        }
    ],
    "Class 2": [
        {
            "chapter": "Numbers up to 1000",
            "aliases": ["Three-Digit Numbers", "Hundreds Place"],
            "subtopics": ["Hundreds, Tens, Ones", "Skip Counting (2s, 5s, 10s)", "Even and Odd Numbers"],
            "question_varieties": ["Place Value Chart", "Expanded Form", "Order of Numbers", "Fill in Blanks"]
        },
        {
            "chapter": "Addition & Subtraction with Regrouping",
            "aliases": ["Carrying and Borrowing"],
            "subtopics": ["2-digit addition with carry", "2-digit subtraction with borrow", "Word problems"],
            "question_varieties": ["Column Addition", "Word Scenarios", "Missing Digit Puzzles"]
        },
        {
            "chapter": "Introduction to Multiplication",
            "aliases": ["Repeated Addition", "Times Tables"],
            "subtopics": ["Tables of 2, 3, 4, 5, 10", "Array Models", "Multiplication Stories"],
            "question_varieties": ["Write as Multiplication", "Grid Multiplication", "Fast Facts Drill"]
        }
    ],
    "Class 3": [
        {
            "chapter": "4-Digit Numbers",
            "aliases": ["Thousands Place", "Place Value System"],
            "subtopics": ["Reading & writing 4-digit numbers", "Face value & place value", "Roman Numerals up to XX"],
            "question_varieties": ["Number Names", "Abacus Representation", "Predecessor & Successor"]
        },
        {
            "chapter": "Multiplication & Division",
            "aliases": ["Multi-digit Operations"],
            "subtopics": ["Tables 6 to 12", "Multiplying 3-digit by 1-digit", "Division as sharing", "Long division intro"],
            "question_varieties": ["Dividend-Divisor-Quotient", "Word Problems", "True/False", "Mental Math"]
        },
        {
            "chapter": "Fractions Basics",
            "aliases": ["Parts of a Whole"],
            "subtopics": ["Half, One-Third, One-Fourth", "Numerator & Denominator", "Fraction of a collection"],
            "question_varieties": ["Shaded Fraction Identification", "Coloring Parts", "Word Questions"]
        }
    ],
    "Class 4": [
        {
            "chapter": "Large Numbers (5 and 6 Digits)",
            "aliases": ["Indian & International Place Value"],
            "subtopics": ["Lakhs place", "Commas and periods", "Rounding off to nearest 10, 100, 1000"],
            "question_varieties": ["System Comparison Table", "Rounding Drills", "HOTS Reasoning"]
        },
        {
            "chapter": "Operations on Fractions",
            "aliases": ["Fraction Mastery"],
            "subtopics": ["Like & Unlike Fractions", "Equivalent Fractions", "Addition and Subtraction of Like Fractions"],
            "question_varieties": ["Simplifying Fractions", "Fill in Missing Numerator", "Real-world Applications"]
        },
        {
            "chapter": "Geometry: Angles, Perimeter & Area",
            "aliases": ["Measurement & Shapes"],
            "subtopics": ["Types of Angles (Acute, Right, Obtuse)", "Perimeter of Rectangle and Square", "Basic Area on Grids"],
            "question_varieties": ["Calculate Perimeter", "Identify Angle Types", "Drawing Exercises"]
        }
    ],
    "Class 5": [
        {
            "chapter": "Numbers up to Crores",
            "aliases": ["7 and 8-Digit Numbers"],
            "subtopics": ["Indian vs International system", "Successor & Predecessor", "Roman Numerals to C"],
            "question_varieties": ["Conversion Problems", "Evaluation Tests", "High-Order Word Problems"]
        },
        {
            "chapter": "Factors, Multiples, HCF & LCM",
            "aliases": ["Number Theory Basics"],
            "subtopics": ["Prime & Composite numbers", "Prime factorisation tree", "HCF by division", "LCM by listing & division"],
            "question_varieties": ["Find HCF/LCM", "True/False on Divisibility", "Problem Solving Scenarios"]
        },
        {
            "chapter": "Decimals & Percentages",
            "aliases": ["Fraction-Decimal-Percent Conversion"],
            "subtopics": ["Tenths, hundredths, thousandths", "Adding & subtracting decimals", "Introduction to %"],
            "question_varieties": ["Conversion Table", "Decimal Word Problems", "Real-life Shopping Drills"]
        }
    ],
    "Class 6": [
        {
            "chapter": "Knowing Our Numbers",
            "aliases": ["Number System", "Large Numbers"],
            "subtopics": ["Estimation & rounding", "Brackets & Roman Numerals", "Units of measurement"],
            "question_varieties": ["MCQ", "Word Problems", "Estimation Drills", "HOTS"]
        },
        {
            "chapter": "Integers",
            "aliases": ["Directed Numbers", "Negative Numbers"],
            "subtopics": ["Number line representation", "Absolute value", "Addition and Subtraction of Integers"],
            "question_varieties": ["Sign Rules", "Evaluating Expressions", "Temperature/Elevation Word Problems"]
        },
        {
            "chapter": "Algebra Basics",
            "aliases": ["Introduction to Variables"],
            "subtopics": ["Matchstick patterns", "Variables and Constants", "Forming Algebraic Expressions"],
            "question_varieties": ["Expression Formation", "Variable Value Substitution", "Linear Equations 1 Step"]
        }
    ],
    "Class 7": [
        {
            "chapter": "Integers: Multiplication & Division",
            "aliases": ["Integer Properties"],
            "subtopics": ["Closure, Commutative, Associative, Distributive", "Word Problems on Integer Operations"],
            "question_varieties": ["Property Verification", "Fill in the Blanks", "HOTS Negative Exponents"]
        },
        {
            "chapter": "Lines and Angles",
            "aliases": ["Geometry & Transversals"],
            "subtopics": ["Complementary & Supplementary", "Adjacent & Linear Pair", "Parallel lines & transversal angles"],
            "question_varieties": ["Finding Missing Angles", "Proof-based Geometry", "MCQ Diagram Based"]
        },
        {
            "chapter": "Comparing Quantities",
            "aliases": ["Ratios, Proportions & Financial Math"],
            "subtopics": ["Ratio and Percentage", "Profit and Loss", "Simple Interest (P*R*T/100)"],
            "question_varieties": ["Word Problems", "Formula Calculation", "Multi-step Scenarios"]
        }
    ],
    "Class 8": [
        {
            "chapter": "Rational Numbers",
            "aliases": ["Real Numbers Foundation"],
            "subtopics": ["Properties of Rational Numbers", "Representation on Number line", "Rational numbers between two rationals"],
            "question_varieties": ["Density of Rationals", "Property Drills", "Fractional Simplification"]
        },
        {
            "chapter": "Linear Equations in One Variable",
            "aliases": ["Equation Solving"],
            "subtopics": ["Variables on both sides", "Cross multiplication", "Application to age, digit and geometry problems"],
            "question_varieties": ["Solve for x", "Detailed Word Problems", "Error Analysis Questions"]
        },
        {
            "chapter": "Algebraic Expressions & Identities",
            "aliases": ["Polynomial Operations"],
            "subtopics": ["(a+b)^2, (a-b)^2, (a^2 - b^2)", "Factorisation using identities", "Polynomial division"],
            "question_varieties": ["Expansion Drills", "Identity Matching", "Step-by-Step Proofs"]
        }
    ],
    "Class 9": [
        {
            "chapter": "Number Systems & Real Numbers",
            "aliases": ["Irrational Numbers & Surds"],
            "subtopics": ["Rationalising the denominator", "Laws of exponents for real numbers", "Decimal expansion (terminating/repeating)"],
            "question_varieties": ["Rationalise", "Prove root 2 is irrational", "Laws of Exponents MCQ"]
        },
        {
            "chapter": "Polynomials",
            "aliases": ["Algebraic Theory"],
            "subtopics": ["Remainder Theorem", "Factor Theorem", "Splitting the middle term", "Cubic polynomial factorisation"],
            "question_varieties": ["Find zeros of polynomial", "Factor completely", "HOTS Polynomial Identity"]
        },
        {
            "chapter": "Linear Equations in Two Variables",
            "aliases": ["Coordinate Linear Algebra"],
            "subtopics": ["ax + by + c = 0 standard form", "Graphing linear equations", "Equations of lines parallel to axes"],
            "question_varieties": ["Find coordinates", "Plot and verify", "Real-world rate problems"]
        }
    ],
    "Class 10": [
        {
            "chapter": "Real Numbers & Euclid's Lemma",
            "aliases": ["Fundamental Theorem of Arithmetic"],
            "subtopics": ["Prime factorisation for HCF and LCM", "Revisiting irrational numbers", "Rational decimals"],
            "question_varieties": ["Proof questions", "HCF/LCM Word Scenarios", "Board Exam Patterns"]
        },
        {
            "chapter": "Quadratic Equations",
            "aliases": ["Second-Degree Equations"],
            "subtopics": ["Factorisation method", "Quadratic formula", "Nature of roots & discriminant (D = b^2 - 4ac)"],
            "question_varieties": ["Find Discriminant", "Find Roots", "Speed/Time Word Problems", "Case Studies"]
        },
        {
            "chapter": "Arithmetic Progressions (AP)",
            "aliases": ["Sequences and Series"],
            "subtopics": ["nth term formula an = a + (n-1)d", "Sum of first n terms Sn = n/2(2a + (n-1)d)", "Daily life AP problems"],
            "question_varieties": ["Sequence Completion", "Word Problem on Savings", "HOTS Multi-level Series"]
        },
        {
            "chapter": "Trigonometry & Heights and Distances",
            "aliases": ["Trigonometric Ratios & Identities"],
            "subtopics": ["sin, cos, tan, cot, sec, cosec", "Values at 0, 30, 45, 60, 90", "Pythagorean trig identities", "Angles of elevation & depression"],
            "question_varieties": ["Prove Identity", "Calculate Height/Distance", "Diagram Interpretation", "MCQs"]
        }
    ],
    "Class 11 & 12 / Intermediate": [
        {
            "chapter": "Sets, Relations & Functions",
            "aliases": ["Advanced Foundations"],
            "subtopics": ["Venn diagrams", "Domain, Codomain, Range", "One-one, onto functions", "Composite & inverse functions"],
            "question_varieties": ["Venn Diagram Calculation", "Injectivity/Surjectivity Check", "Proof questions"]
        },
        {
            "chapter": "Differential Calculus & Derivatives",
            "aliases": ["Calculus 1"],
            "subtopics": ["Limits and Continuity", "Product and Quotient Rule", "Chain Rule", "Applications of Derivatives (Rate of Change, Maxima/Minima)"],
            "question_varieties": ["Evaluate Limits", "Find dy/dx", "Maxima & Minima Real World", "HOTS Optimization"]
        },
        {
            "chapter": "Integral Calculus & Differential Equations",
            "aliases": ["Calculus 2"],
            "subtopics": ["Indefinite integrals (substitution, parts)", "Definite integrals & properties", "Area under curves", "Separable differential equations"],
            "question_varieties": ["Integration by Parts", "Area Calculation", "Solve Differential Equation"]
        }
    ]
}

def export_json(filepath="data/global_curriculum.json"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(GLOBAL_MATH_CURRICULUM, f, indent=2, ensure_ascii=False)
    print(f"[OK] Global math curriculum database exported successfully to: {filepath}")

def get_chapters_for_grade(grade):
    return GLOBAL_MATH_CURRICULUM.get(grade, [])

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "data/global_curriculum.json"
    export_json(target)
