const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description",
    ),
  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The technical question asked during the interview"),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this technical question",
          ),
        answer: z
          .string()
          .describe(
            "how to answer this question, what points to cover,what approach to take etc",
          ),
      }),
    )
    .describe(
      "Technical quetions asked during the interview, along with their intentions and how to answer them",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("The behavioral question asked during the interview"),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this behavioral question",
          ),
        answer: z
          .string()
          .describe(
            "how to answer this question, what points to cover,what approach to take etc",
          ),
      }),
    )
    .describe(
      "Behavioral quetions asked during the interview, along with their intentions and how to answer them",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("The skill in which candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe(
            "The severity of this skill gap, i.e how important is this skill for the job role and how much candidate is lacking in this skill",
          ),
      }),
    )
    .describe(
      "list of skill gaps in candidate's profile that were identified during the interview",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number in the preparation plan"),
        focus: z
          .string()
          .describe("The main focus of this day in the preparation plan"),
        tasks: z
          .array(z.string())
          .describe(
            "The tasks to be done on this day in order to prepare for the interview",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to prepare for future interviews, based on the feedback and insights from this interview",
    ),
});

async function generateInterviewReport({resume, selfDescription, jobDescription,}) {

    const prompt = `Generate a detailed interview report for a candidate based on the following information:Resume: ${resume} Self Description: ${selfDescription} Job Describe: ${jobDescription} The report should include:1. Match Score: A score between 0 and 100 indicating how well the candidate's profile matches the job description.2. Technical Questions: A list of technical questions that were asked during the interview, along with their intentions and how to answer them.3. Behavioral Questions: A list of behavioral questions that were asked during the interview, along with their intentions and how to answer them.4. Skill Gaps: A list of skill gaps in the candidate's profile that were identified during the interview, along with their severity (low, medium, high).5. Preparation Plan: A day-wise preparation plan for the candidate to prepare for future interviews, based on the feedback and insights from this interview.`; ;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text)
}
module.exports = generateInterviewReport;
