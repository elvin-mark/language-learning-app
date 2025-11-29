# backend/agents/practice_agent.py
from sqlalchemy.orm import Session
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from .. import crud, schemas

# Initialize LLM
try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.8)
except Exception as e:
    print(f"Error initializing LLM: {e}")
    llm = None


class PracticeAgent:
    def __init__(self, db: Session):
        self.db = db
        if not llm:
            raise ImportError("Google Generative AI model could not be initialized.")

    def generate_exercise(
        self, request: schemas.ExerciseRequest
    ) -> schemas.ExerciseDetails | None:
        """
        Generates a personalized practice exercise using the model's structured output feature.
        """
        # 1. Fetch user's weak points
        weakest_grammar = crud.get_weakest_grammar_pattern(self.db)
        vocab_for_drilling = crud.get_vocab_for_drilling(self.db, count=5)

        # 2. Determine exercise type
        exercise_type = request.type
        sub_type = request.sub_type

        if not exercise_type:
            if weakest_grammar and weakest_grammar.mastery_score < 0.6:
                exercise_type, sub_type = "Writing", "Targeted Essay"
            elif vocab_for_drilling:
                exercise_type, sub_type = "Flashcards", "Translation Recall"
            else:
                exercise_type, sub_type = "Reading", "Short Story/Article Analysis"

        if not sub_type:
            sub_type = {
                "Writing": "Targeted Essay",
                "Flashcards": "Translation Recall",
                "Reading": "Short Story/Article Analysis",
            }.get(exercise_type, "Targeted Essay")

        # 3. Use LLM's structured output for a reliable JSON response
        structured_llm = llm.with_structured_output(schemas.ExerciseDetails)

        prompt = ChatPromptTemplate.from_template(
            """You are a creative Korean language teacher. Generate a single practice exercise as a JSON object.

**Exercise Goal:**
- **Type**: `{type}`
- **Sub-Type**: `{sub_type}`

**User's Weak Points:**
- **Weakest Grammar Pattern**: `{grammar_pattern}` (Mastery: {grammar_mastery:.2f})
- **Grammar Weakness Flags**: `{grammar_flags}`
- **Vocabulary to Drill**: `{vocab_list}`

**Instructions:**
- Create a `question_text` for the exercise.
- For a "Targeted Essay," the prompt MUST require using the `{grammar_pattern}` and should address the `{grammar_flags}`.
- Determine a suitable `expected_format` (e.g., "essay", "single word").
- The `type` and `sub_type` in the output must match the goal. Set `exercise_id` to 0.
"""
        )

        chain = prompt | structured_llm

        try:
            exercise_details = chain.invoke(
                {
                    "type": exercise_type,
                    "sub_type": sub_type,
                    "grammar_pattern": weakest_grammar.pattern
                    if weakest_grammar
                    else "None",
                    "grammar_mastery": weakest_grammar.mastery_score
                    if weakest_grammar
                    else 1.0,
                    "grammar_flags": weakest_grammar.weakness_flags
                    if weakest_grammar
                    else "None",
                    "vocab_list": [v.word_korean for v in vocab_for_drilling],
                }
            )
        except Exception as e:
            print(f"Error invoking structured LLM chain for exercise generation: {e}")
            return None

        # 4. Save the generated exercise
        db_exercise = crud.create_exercise(self.db, exercise_data=exercise_details)
        exercise_details.exercise_id = db_exercise.exercise_id

        return exercise_details
