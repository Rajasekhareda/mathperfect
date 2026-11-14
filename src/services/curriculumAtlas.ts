/**
 * Built-in Curriculum Atlas Fallback
 */
export const curriculumAtlas = {
  grades: [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"
  ],
  boards: ["CBSE", "ICSE", "Common Core", "Cambridge", "State Board"],
  getChapters(grade: string) {
    return [
      "Number Systems & Arithmetic",
      "Algebra & Equations",
      "Geometry & Measurement",
      "Data Handling & Probability"
    ];
  }
};
export default curriculumAtlas;
