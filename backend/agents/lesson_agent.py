# backend/agents/lesson_agent.py
from sqlalchemy.orm import Session
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from .. import crud, schemas

# Initialize LLM
try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
except Exception as e:
    print(f"Error initializing LLM: {e}")
    llm = None


class LessonAgent:
    def __init__(self, db: Session):
        self.db = db
        if not llm:
            raise ImportError("Google Generative AI model could not be initialized.")

    def generate_lesson(self) -> schemas.LessonContent | None:
        """
        Generates the next personalized lesson using the model's structured output feature.
        """
        # 1. Get weakest grammar and new vocab from the database
        weakest_grammar = crud.get_weakest_grammar_pattern(self.db)
        if not weakest_grammar:
            return None

        new_vocabulary = crud.get_new_vocabulary(self.db, count=5)
        new_vocab_schema = [
            schemas.NewVocabularyItem(
                korean=v.word_korean, english="<translation_needed>"
            )
            for v in new_vocabulary
        ]

        # 2. Use LLM's structured output feature for a reliable JSON response
        structured_llm = llm.with_structured_output(schemas.LessonContent)

        prompt = ChatPromptTemplate.from_template(
            """You are an expert and friendly Korean language teacher. Your task is to create a concise, personalized lesson and return it as a JSON object.

**User's Current Status:**
- **Grammar Pattern to Learn:** `{grammar_pattern}`
- **Current Mastery Score:** {mastery_score:.2f} (A score from 0.0 to 1.0)
- **Known Issues/Weakness Flags:** `{weakness_flags}` (These are specific errors the user has made before. Address them in your explanation.)

**Lesson Requirements:**
1.  **`explanation_text`**: Write a clear and simple explanation of the grammar pattern. If there are weakness flags, provide examples that specifically correct those mistakes.
2.  **`example_sentences`**: Create 3-4 diverse and practical example sentences that use the grammar pattern correctly.
3.  **Integrate Vocabulary**: Naturally include some of these **new vocabulary words** (`{new_vocab_list}`) within your example sentences.

Fill the `grammar_pattern` and `new_vocabulary` fields in the output with the exact data provided. Set `lesson_id` to 0 as a placeholder.
"""
        )

        chain = prompt | structured_llm

        try:
            lesson_data_from_llm = chain.invoke(
                {
                    "grammar_pattern": weakest_grammar.pattern,
                    "mastery_score": weakest_grammar.mastery_score,
                    "weakness_flags": weakest_grammar.weakness_flags or "None",
                    "new_vocab_list": [v.korean for v in new_vocab_schema],
                    "new_vocabulary": [v.model_dump() for v in new_vocab_schema],
                }
            )
        except Exception as e:
            print(f"Error invoking structured LLM chain for lesson generation: {e}")
            return None

        # 3. Save the complete lesson to the database
        db_lesson = crud.create_lesson(self.db, lesson_data=lesson_data_from_llm)

        # 4. Return the final, validated schema with the database ID
        lesson_data_from_llm.lesson_id = db_lesson.lesson_id

        return lesson_data_from_llm
