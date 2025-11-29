from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session
from .. import crud, schemas
import json

# Initialize the generative model
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.7)


class EvaluationAgent:
    def __init__(self, db: Session):
        self.db = db

    def _grade_submission_and_feedback(
        self, exercise_details: dict, user_response: str
    ):
        """
        Uses LLM to grade the submission and provide feedback.
        """
        prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a Korean language teacher. Grade the user's submission, provide constructive feedback, and identify any grammar or vocabulary errors. Output a JSON object with 'grade' (0-100) and 'feedback_text' (string).",
                ),
                (
                    "user",
                    f"Original Exercise:\n{exercise_details['question_text']}\nExpected Format: {exercise_details['expected_format']}\nUser Submission:\n{user_response}\nTarget Grammar: {exercise_details.get('target_grammar', 'None')}\nTarget Vocabulary: {', '.join(exercise_details.get('target_vocab', []))}\nPlease provide a grade (0-100) and detailed feedback, focusing on correctness, naturalness, and whether the target grammar/vocab were used correctly. Identify specific errors.",
                ),
            ]
        )
        parser = JsonOutputParser(
            pydantic_object=schemas.EvaluationResult
        )  # Will only parse the grade and feedback part
        chain = prompt_template | llm | parser
        response = chain.invoke({})
        return response.grade, response.feedback_text

    def _analyze_errors_and_update_mastery(
        self, exercise_details: dict, user_response: str, grade: int
    ):
        """
        Analyzes the submission for errors, updates weakness flags, and mastery scores.
        This is a simplified implementation. A more robust one would involve more sophisticated
        NLP for error detection.
        """
        mastery_updates = []
        weakness_flags_added = []

        # Simulate error analysis for grammar
        target_grammar = exercise_details.get("target_grammar")
        if target_grammar:
            db_grammar = crud.get_grammar_mastery(self.db, target_grammar)
            if not db_grammar:
                db_grammar = crud.create_grammar_mastery(self.db, target_grammar)

            original_flags = (
                json.loads(db_grammar.weakness_flags)
                if db_grammar.weakness_flags
                else []
            )
            new_score = db_grammar.mastery_score

            if grade < 70:  # Assume an error if grade is low
                # Simulate adding a weakness flag
                if "incorrect usage" not in original_flags:
                    original_flags.append("incorrect usage")
                    weakness_flags_added.append("incorrect usage")
                new_score = max(0.0, db_grammar.mastery_score - 0.1)  # Decrease score
            else:
                new_score = min(1.0, db_grammar.mastery_score + 0.05)  # Increase score

            crud.update_grammar_mastery(
                self.db, target_grammar, new_score, original_flags
            )
            mastery_updates.append(
                schemas.MasteryUpdate(
                    concept=target_grammar,
                    new_score=new_score,
                    flags_added=weakness_flags_added if weakness_flags_added else None,
                )
            )

        # Simulate mastery update for vocabulary (very basic)
        target_vocab = exercise_details.get("target_vocab", [])
        for word in target_vocab:
            db_vocab = crud.get_vocabulary_mastery(self.db, word)
            if not db_vocab:
                db_vocab = crud.create_vocabulary_mastery(self.db, word)

            new_vocab_score = db_vocab.mastery_score
            times_correct = db_vocab.times_correct
            times_incorrect = db_vocab.times_incorrect

            if (
                user_response.lower().count(word.lower()) > 0 and grade > 70
            ):  # If word used and good grade
                new_vocab_score = min(1.0, db_vocab.mastery_score + 0.02)
                times_correct += 1
            else:
                new_vocab_score = max(0.0, db_vocab.mastery_score - 0.05)
                times_incorrect += 1

            crud.update_vocabulary_mastery(
                self.db, word, new_vocab_score, times_correct, times_incorrect
            )
            mastery_updates.append(
                schemas.MasteryUpdate(concept=word, new_score=new_vocab_score)
            )

        return mastery_updates

    def evaluate_submission(
        self, submission: schemas.Submission
    ) -> schemas.EvaluationResult:
        exercise = crud.get_exercise(self.db, submission.exercise_id)
        if not exercise:
            # Handle error: exercise not found
            return schemas.EvaluationResult(
                grade=0, feedback_text="Exercise not found.", mastery_updates=[]
            )

        exercise_details = exercise.get_question_data()

        # Step 1: Grade submission and get feedback
        grade, feedback_text = self._grade_submission_and_feedback(
            exercise_details, submission.user_response
        )

        # Step 2: Analyze errors and update mastery
        mastery_updates = self._analyze_errors_and_update_mastery(
            exercise_details, submission.user_response, grade
        )

        # Update the exercise record with user's submission, grade, and feedback
        crud.update_exercise_submission(
            self.db,
            submission.exercise_id,
            submission.user_response,
            grade,
            feedback_text,
        )

        return schemas.EvaluationResult(
            grade=grade, feedback_text=feedback_text, mastery_updates=mastery_updates
        )
