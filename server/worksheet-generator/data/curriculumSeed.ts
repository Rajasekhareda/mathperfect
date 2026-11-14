/**
 * CBSE Mathematics Curriculum Database Seed Data.
 * Comprehensive chapter/topic data for grades LKG through Class 12.
 * Auto-generated - do not edit directly.
 */

export interface ChapterSeed {
  grade: string;
  chapterName: string;
  subtopics: string;
  objectives: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionTypes: string;
  gradeBand: string;
}

export const CURRICULUM_SEED: ChapterSeed[] = [
  { grade: "LKG", chapterName: "Pre-Math Concepts", subtopics: "Big/Small, Tall/Short, Heavy/Light", objectives: "Compare objects by size", difficulty: "Easy", questionTypes: "MCQ,True/False", gradeBand: "pre-primary" },
  { grade: "LKG", chapterName: "Numbers 1-10", subtopics: "Counting, Number recognition", objectives: "Count to 10", difficulty: "Easy", questionTypes: "MCQ,Fill,Pattern", gradeBand: "pre-primary" },
  { grade: "LKG", chapterName: "Shapes", subtopics: "Circle, Square, Triangle, Rectangle", objectives: "Identify 2D shapes", difficulty: "Easy", questionTypes: "MCQ,True/False", gradeBand: "pre-primary" },
  { grade: "LKG", chapterName: "Patterns", subtopics: "Colour, Size, Shape patterns", objectives: "Recognize patterns", difficulty: "Easy", questionTypes: "MCQ,Pattern", gradeBand: "pre-primary" },
  { grade: "UKG", chapterName: "Numbers 1-20", subtopics: "Counting, Number names", objectives: "Count to 20", difficulty: "Easy", questionTypes: "MCQ,Fill,Pattern", gradeBand: "pre-primary" },
  { grade: "UKG", chapterName: "Add and Sub", subtopics: "Put together, Take away", objectives: "Add/sub within 10", difficulty: "Easy", questionTypes: "MCQ,Fill,Word", gradeBand: "pre-primary" },
  { grade: "UKG", chapterName: "Shapes and Solids", subtopics: "2D shapes, 3D solids", objectives: "Identify 3D solids", difficulty: "Easy", questionTypes: "MCQ,True/False", gradeBand: "pre-primary" },
  { grade: "UKG", chapterName: "Measurement", subtopics: "Long/Short, Heavy/Light", objectives: "Compare lengths", difficulty: "Easy", questionTypes: "MCQ,True/False", gradeBand: "pre-primary" },
  { grade: "UKG", chapterName: "Time and Money", subtopics: "Days, Coins", objectives: "Identify coins", difficulty: "Easy", questionTypes: "MCQ,Fill", gradeBand: "pre-primary" },
  { grade: "Class 1", chapterName: "Numbers 1-100", subtopics: "Counting, Place value", objectives: "Read/write to 100", difficulty: "Easy", questionTypes: "MCQ,Fill,Pattern", gradeBand: "primary" },
  { grade: "Class 1", chapterName: "Addition", subtopics: "Single digit, Carry", objectives: "Add within 100", difficulty: "Easy", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 1", chapterName: "Subtraction", subtopics: "Borrow", objectives: "Subtract within 100", difficulty: "Easy", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 1", chapterName: "Measurement", subtopics: "Length, Weight, Time", objectives: "Measure and compare", difficulty: "Easy", questionTypes: "MCQ,True/False", gradeBand: "primary" },
  { grade: "Class 1", chapterName: "Money", subtopics: "Coins, Notes", objectives: "Identify denominations", difficulty: "Easy", questionTypes: "MCQ,Word", gradeBand: "primary" },
  { grade: "Class 2", chapterName: "Numbers 1-1000", subtopics: "3-digit, Place value", objectives: "Read/write to 1000", difficulty: "Easy", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 2", chapterName: "Add and Sub (1000)", subtopics: "3-digit operations", objectives: "Add/sub 3-digit", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 2", chapterName: "Multiplication Intro", subtopics: "Repeated add, Tables 2-5", objectives: "Memorize tables", difficulty: "Easy", questionTypes: "MCQ,Fill,Word,Pattern", gradeBand: "primary" },
  { grade: "Class 2", chapterName: "Division Intro", subtopics: "Equal sharing, Grouping", objectives: "Understand division", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 2", chapterName: "Geometry", subtopics: "Lines, Curves, Shapes", objectives: "Identify shapes", difficulty: "Easy", questionTypes: "MCQ,True/False,Match", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Numbers and Operations", subtopics: "4-digit, Roman numerals", objectives: "Work with 4-digit", difficulty: "Easy", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Add and Sub (4-digit)", subtopics: "Column operations", objectives: "Add/sub 4-digit", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Multiplication", subtopics: "Tables 6-12, Multi-digit", objectives: "Master tables 6-12", difficulty: "Medium", questionTypes: "MCQ,Fill,Word,Pattern", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Division", subtopics: "Long division, Remainder", objectives: "Divide with remainder", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Fractions", subtopics: "Unit fractions, Equivalent", objectives: "Understand fractions", difficulty: "Medium", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Measurement", subtopics: "Length, Weight, Capacity", objectives: "Convert units", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 3", chapterName: "Geometry", subtopics: "Angles, Perimeter, Area", objectives: "Calculate perimeter", difficulty: "Medium", questionTypes: "MCQ,True/False,Short", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Large Numbers", subtopics: "5-6 digit, Lakhs", objectives: "Read/write to lakhs", difficulty: "Easy", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Multiplication (multi)", subtopics: "2-digit x 2-digit", objectives: "Multiply multi-digit", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Division (multi)", subtopics: "3-digit / 1-digit", objectives: "Divide multi-digit", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Fractions", subtopics: "Unlike fractions, Add/Sub", objectives: "Add/sub unlike fractions", difficulty: "Medium", questionTypes: "MCQ,Fill,Short", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Decimals Intro", subtopics: "Tenths, Hundredths", objectives: "Understand decimals", difficulty: "Medium", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 4", chapterName: "Geometry", subtopics: "Angles, Perimeter, Area", objectives: "Classify angles", difficulty: "Medium", questionTypes: "MCQ,True/False,Short", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Large Numbers", subtopics: "7-digit, Crores", objectives: "Work with 7-digit", difficulty: "Easy", questionTypes: "MCQ,Fill,True/False", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Four Operations", subtopics: "Add, Sub, BODMAS", objectives: "All four operations", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Fractions and Decimals", subtopics: "Multiply, Divide", objectives: "Operate on fractions", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Percentage Intro", subtopics: "Concept, Conversions", objectives: "Understand percentage", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Measurement", subtopics: "Length, Weight, Volume", objectives: "Convert units", difficulty: "Medium", questionTypes: "MCQ,Fill,Word", gradeBand: "primary" },
  { grade: "Class 5", chapterName: "Geometry", subtopics: "Angles, Triangles, Area", objectives: "Measure angles", difficulty: "Medium", questionTypes: "MCQ,True/False,Short", gradeBand: "primary" },
];
