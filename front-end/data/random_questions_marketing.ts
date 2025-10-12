// data/random_questions_marketing.ts

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  lessonTitle: string;
  questionText: string;
  options: Option[];
  correctOptionId: string;
  difficulty: 'easy' | 'hard';
}

export const marketingQuizQuestions: Question[] = [
  // --- CÁC CÂU HỎI DỄ ---
  {
    id: "q1",
    lessonTitle: "Present Perfect Tense",
    questionText: "“I have lived here for 5 years” là thì gì?",
    options: [
      { id: "q1_opt1", text: "Present Perfect" },
      { id: "q1_opt2", text: "Past Simple" },
      { id: "q1_opt3", text: "Future Perfect" },
      { id: "q1_opt4", text: "Present Simple" },
    ],
    correctOptionId: "q1_opt1",
    difficulty: 'easy',
  },
  {
    id: "q2",
    lessonTitle: "Past Simple Tense",
    questionText: "Chọn động từ ở dạng Quá khứ đơn của 'go'",
    options: [
      { id: "q2_opt1", text: "Gone" },
      { id: "q2_opt2", text: "Goes" },
      { id: "q2_opt3", text: "Went" },
      { id: "q2_opt4", text: "Going" },
    ],
    correctOptionId: "q2_opt3",
    difficulty: 'easy',
  },

  // --- CÁC CÂU HỎI KHÓ ---
  {
    id: "q4",
    lessonTitle: "Conditional Sentences",
    questionText: "Điền vào chỗ trống: 'If I had known you were in hospital, I ____ you.'",
    options: [
      { id: "q4_opt1", text: "would visit" },
      { id: "q4_opt2", text: "would have visited" },
      { id: "q4_opt3", text: "will visit" },
      { id: "q4_opt4", text: "visited" },
    ],
    correctOptionId: "q4_opt2",
    difficulty: 'hard',
  },
  {
    id: "q5",
    lessonTitle: "Subjunctive Mood",
    questionText: "Chọn câu đúng ngữ pháp:",
    options: [
      { id: "q5_opt1", text: "I suggest that she goes to the doctor." },
      { id: "q5_opt2", text: "I suggest that she go to the doctor." },
      { id: "q5_opt3", text: "I suggest she to go to the doctor." },
      { id: "q5_opt4", text: "I suggest her going to the doctor." },
    ],
    correctOptionId: "q5_opt2",
    difficulty: 'hard',
  },
  {
    id: "q6",
    lessonTitle: "Phrasal Verbs",
    questionText: "Từ 'put up with' trong câu 'I can't put up with his attitude anymore' có nghĩa là gì?",
    options: [
      { id: "q6_opt1", text: "Dựng lên" },
      { id: "q6_opt2", text: "Hoãn lại" },
      { id: "q6_opt3", text: "Chịu đựng" },
      { id: "q6_opt4", text: "Đề xuất" },
    ],
    correctOptionId: "q6_opt3",
    difficulty: 'hard',
  },
];