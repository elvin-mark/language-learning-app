# backend/agents/lesson_agent.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session
from .. import crud, schemas
from datetime import datetime, timedelta
import json

# Initialize the generative model
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)


class LessonAgent:
    def __init__(self, db: Session):
        self.db = db

    def _get_weakest_grammar_pattern(self):
        """
        Queries the database to find the grammar pattern with the lowest mastery score
        or the oldest last_reviewed date.
        """
        # Prioritize lowest mastery score
        weakest_grammar = (
            self.db.query(crud.models.GrammarMastery)
            .order_by(
                crud.models.GrammarMastery.mastery_score.asc(),
                crud.models.GrammarMastery.last_reviewed.asc(),
            )
            .first()
        )

        if weakest_grammar:
            return weakest_grammar

        # If no grammar patterns exist, return a default for initial lesson
        return crud.models.GrammarMastery(
            pattern="Verb + (으)ㅂ니다/습니다 (Formal Ending)",
            mastery_score=0.0,
            last_reviewed=datetime.utcnow() - timedelta(days=30),  # Make it seem old
            weakness_flags=json.dumps([]),
        )

    def _select_new_vocabulary(self, grammar_pattern: str):
        """
        Selects 5-10 new vocabulary items relevant to the grammar pattern.
        For now, this is a placeholder. In a real scenario, this would involve
        a more sophisticated selection based on context, level, and existing vocabulary.
        """
        # Placeholder for now
        if "Verb + (으)ㅂ니다/습니다" in grammar_pattern:
            return [
                schemas.NewVocabularyItem(korean="하다", english="to do"),
                schemas.NewVocabularyItem(korean="먹다", english="to eat"),
                schemas.NewVocabularyItem(korean="가다", english="to go"),
                schemas.NewVocabularyItem(korean="오다", english="to come"),
                schemas.NewVocabularyItem(korean="공부하다", english="to study"),
            ]
        return [
            schemas.NewVocabularyItem(korean="새로운", english="new"),
            schemas.NewVocabularyItem(korean="단어", english="word"),
        ]

    def generate_lesson(self) -> schemas.LessonContent:
        weakest_grammar = self._get_weakest_grammar_pattern()
        new_vocabulary = self._select_new_vocabulary(weakest_grammar.pattern)

        # prompt_template = ChatPromptTemplate.from_messages([
        #     ("system", "You are a helpful Korean language tutor. Generate a personalized lesson."),
        #     ("user", f"Generate a lesson on the grammar pattern: '{weakest_grammar.pattern}'. "
        #              f"The user's current mastery score for this is {weakest_grammar.mastery_score:.2f}. "
        #              f"Weakness flags: {json.loads(weakest_grammar.weakness_flags) if weakest_grammar.weakness_flags else 'None'}. "
        #              f"Include an explanation, 3-4 example sentences using the pattern, and incorporate the following new vocabulary: {', '.join([v.korean for v in new_vocabulary])}. "
        #              "The output should be a JSON object with 'grammar_pattern', 'explanation_text', 'example_sentences' (list of strings), and 'new_vocabulary' (list of {'korean': '...', 'english': '...'} objects).")
        # ])

        prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are a helpful Korean language tutor. Generate a personalized lesson.",
                ),
                (
                    "user",
                    "Generate a lesson on the grammar pattern: '{grammar_pattern}'. "
                    "The user's current mastery score for this is {mastery_score:.2f}. "
                    "Weakness flags: {weakness_flags}. "
                    "Include an explanation, 3-4 example sentences using the pattern, and incorporate "
                    "the following new vocabulary: {new_vocabulary}. "
                    "The output should be a JSON object with "
                    "'grammar_pattern', 'explanation_text', 'example_sentences' (list of strings), "
                    "and 'new_vocabulary' (list of {{'korean': '...', 'english': '...'}} objects).",
                ),
            ]
        )

        parser = JsonOutputParser(pydantic_object=schemas.LessonContent)

        chain = prompt_template | llm | parser

        # Invoke the chain
        response = chain.invoke(
            {
                "grammar_pattern": weakest_grammar.pattern,
                "mastery_score": weakest_grammar.mastery_score,
                "weakness_flags": json.loads(weakest_grammar.weakness_flags)
                if weakest_grammar.weakness_flags
                else [],
                "new_vocabulary": new_vocabulary,
            }
        )

        # Save the generated lesson to the database
        db_lesson = crud.create_lesson(
            self.db,
            grammar_focus=response["grammar_pattern"],
            content=response["explanation_text"],
            new_vocabulary=[item for item in response["new_vocabulary"]],
        )
        response["lesson_id"] = db_lesson.lesson_id
        return response
