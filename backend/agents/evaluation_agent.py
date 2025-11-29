# backend/agents/evaluation_agent.py
from sqlalchemy.orm import Session
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from .. import crud, schemas

# Initialize LLM
try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)
except Exception as e:
    print(f"Error initializing LLM: {e}")
    llm = None


class EvaluationAgent:
    def __init__(self, db: Session):
        self.db = db
        if not llm:
            raise ImportError(
                "Google Generative AI model could not be initialized. Please check your API key."
            )

    def evaluate_submission(
        self, submission: schemas.Submission
    ) -> schemas.EvaluationResult | None:
        """
        Orchestrates the evaluation of a user's submission using the model's structured output feature.
        """
        # 1. Fetch the original exercise
        exercise = crud.get_exercise(self.db, submission.exercise_id)
        if not exercise:
            print(f"Error: Exercise with ID {submission.exercise_id} not found.")
            return None

        exercise_details = schemas.ExerciseDetails.model_validate(
            exercise.question_data
        )

        # This is a simplification. In a real app, the target concept
        # would be explicitly stored with the exercise.
        target_concept = crud.get_weakest_grammar_pattern(self.db)
        if not target_concept:
            return None

        # 2. Use LLM's structured output for a reliable JSON response
        structured_llm = llm.with_structured_output(schemas.EvaluationResult)

        prompt = ChatPromptTemplate.from_template(
            """You are an expert Korean language teacher and data analyst. Your task is to evaluate a user's exercise submission and generate a detailed, structured JSON response.

**Context:**
- **Exercise Question**: "{question_text}"
- **Target Concept**: "{target_concept}"
- **User's Current Mastery Score**: {current_mastery_score:.2f}
- **User's Known Weakness Flags**: {current_weakness_flags}

**User's Submission:**
- `user_response`: "{user_response}"

**Your Tasks:**
1.  **`grade`**: Assign an integer grade (0-100).
2.  **`feedback_text`**: Write clear, constructive feedback.
3.  **`mastery_updates`**: Generate a list containing ONE update object for the `{target_concept}`.
    -   `concept`: Must be the `target_concept` string: "{target_concept}".
    -   `new_score`: Calculate a new mastery score (float between 0.0 and 1.0). Increase for correct usage, decrease for incorrect usage. The change should be proportional to the performance.
    -   `flags_added`: Analyze the user's errors. If you find a specific, new error type not listed in `current_weakness_flags`, add it to this list. Otherwise, return an empty list `[]`.

Produce a valid JSON object based on these instructions.
"""
        )

        chain = prompt | structured_llm

        try:
            evaluation_result = chain.invoke(
                {
                    "question_text": exercise_details.question_text,
                    "target_concept": target_concept.pattern,
                    "current_mastery_score": target_concept.mastery_score,
                    "current_weakness_flags": target_concept.weakness_flags or "None",
                    "user_response": submission.user_response,
                }
            )
        except Exception as e:
            print(f"Error invoking structured LLM chain for evaluation: {e}")
            return None

        # 3. Persist results to the database
        crud.update_exercise_with_submission(self.db, submission, evaluation_result)
        crud.update_mastery_after_evaluation(self.db, evaluation_result)

        return evaluation_result
