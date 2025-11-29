# backend/agents/practice_agent.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session
from .. import crud, schemas
import json

# Initialize the generative model
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)


class PracticeAgent:
    def __init__(self, db: Session):
        self.db = db

    def _get_weakest_grammar_and_vocab(self):
        """
        Queries the database to find the grammar pattern with the lowest mastery score
        and vocabulary items with scores between 0.4 and 0.7 for drilling.
        """
        weakest_grammar = (
            self.db.query(crud.models.GrammarMastery)
            .order_by(crud.models.GrammarMastery.mastery_score.asc())
            .first()
        )

        drilling_vocab = (
            self.db.query(crud.models.VocabularyMastery)
            .filter(
                crud.models.VocabularyMastery.mastery_score >= 0.4,
                crud.models.VocabularyMastery.mastery_score <= 0.7,
            )
            .limit(5)
            .all()
        )

        return weakest_grammar, drilling_vocab

    def generate_exercise(
        self, exercise_request: schemas.ExerciseRequest
    ) -> schemas.ExerciseDetails:
        weakest_grammar, drilling_vocab = self._get_weakest_grammar_and_vocab()

        exercise_type = exercise_request.type
        sub_type = exercise_request.sub_type

        # Basic logic for selecting exercise type if not specified
        if not exercise_type:
            if weakest_grammar and weakest_grammar.mastery_score < 0.5:
                exercise_type = "Writing"
                sub_type = "Targeted Essay"
            elif drilling_vocab:
                exercise_type = "Flashcards"
                sub_type = "Translation Recall"
            else:
                exercise_type = "Reading"
                sub_type = "Short Story/Article Analysis"

        prompt_template_str = f"""
        You are a Korean language exercise generator. Create an exercise.
        The user wants an exercise of type: '{exercise_type}' and sub-type: '{sub_type}'.

        Focus on the following weakest grammar pattern (if applicable): '{weakest_grammar.pattern if weakest_grammar else "None"}' with mastery score {weakest_grammar.mastery_score if weakest_grammar else 1.0}.
        Weakness flags for grammar: {json.loads(weakest_grammar.weakness_flags) if weakest_grammar and weakest_grammar.weakness_flags else "None"}.

        For vocabulary drilling, include some of these words: {", ".join([v.word_korean for v in drilling_vocab])}.

        Provide a clear 'question_text' and specify the 'expected_format' for the user's response.
        The output should be a JSON object with 'exercise_id' (integer, placeholder for now), 'type', 'sub_type', 'question_text', and 'expected_format'.
        """

        prompt_template = ChatPromptTemplate.from_messages(
            [
                ("system", "You are a helpful Korean language exercise generator."),
                ("user", prompt_template_str),
            ]
        )

        parser = JsonOutputParser(pydantic_object=schemas.ExerciseDetails)

        chain = prompt_template | llm | parser

        response = chain.invoke(
            {
                "exercise_type": exercise_type,
                "sub_type": sub_type,
                "weakest_grammar": weakest_grammar,
                "drilling_vocab": [v.word_korean for v in drilling_vocab],
            }
        )

        # Save the generated exercise to the database
        db_exercise = crud.create_exercise(
            self.db,
            type=response["type"],
            sub_type=response["sub_type"],
            question_data={
                "question_text": response["question_text"],
                "expected_format": response["expected_format"],
                "target_grammar": weakest_grammar.pattern if weakest_grammar else None,
                "target_vocab": [v.word_korean for v in drilling_vocab],
            },
        )
        response["exercise_id"] = db_exercise.exercise_id
        return response
