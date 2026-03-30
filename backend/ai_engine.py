import os
from typing import List, Optional
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

# Define Structured Output Models
class WordInfo(BaseModel):
    text: str = Field(description="The word or phrase in the target language (e.g., Korean, Japanese, Chinese)")
    meaning: str = Field(description="English translation of the word")
    pronunciation: Optional[str] = Field(None, description="Phonetic transcription (e.g., Romanization, Pinyin, Hiragana)")

class GrammarInfo(BaseModel):
    pattern: str = Field(description="The grammar pattern used (e.g., -고 싶다, -아요/어요)")
    explanation: str = Field(description="Simple explanation of how the grammar works")
    example: str = Field(description="An example sentence using this grammar")

class FeedbackInfo(BaseModel):
    is_correct: bool = Field(description="Whether the user message is grammatically correct")
    correction: Optional[str] = Field(None, description="Corrected version of the user sentence")
    explanation: Optional[str] = Field(None, description="Explanation of the correction or naturalness")
    natural_score: int = Field(description="How natural the user sentence sounds (1-10)")

class AISystemResponse(BaseModel):
    response_target: str = Field(description="The natural response to the user's message in the target language")
    response_english: str = Field(description="The English translation of the AI response")
    feedback: Optional[FeedbackInfo] = Field(None, description="Analysis of the user's input if it was in the target language")
    vocabulary: List[WordInfo] = Field(default_factory=list, description="Key words used in the AI response")
    grammar: List[GrammarInfo] = Field(default_factory=list, description="Key grammar patterns used in the AI response")

class AIEngine:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")

    def get_llm(self, provider: str = "groq", local_url: Optional[str] = None):
        if provider == "local" and local_url:
            llm = ChatOpenAI(
                base_url=local_url,
                api_key="sk-not-needed", # Local servers usually don't need real keys
                temperature=0.7,
                # Note: Local model name depends on the server (e.g. 'llama3', 'mistral')
                # Many servers just use 'model' or 'default'
                model_name="local-model" 
            )
            # Use json_mode for local LLMs as they often don't support the latest OpenAI 'Structured Outputs' API
            return llm.with_structured_output(AISystemResponse, method="json_mode", include_raw=True)
        else:
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                api_key=self.groq_api_key
            )
        
        return llm.with_structured_output(AISystemResponse, include_raw=True)

    def _clean_json_string(self, text: str) -> str:
        """Helper to extract JSON from markdown-wrapped or messy LLM output."""
        text = text.strip()
        # Remove markdown code markers if they exist
        if text.startswith("```"):
            # Split and find the first line that isn't a marker
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
        
        # Find the first { and the last }
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            return text[start_idx:end_idx + 1]
        
        return text

    def generate_response(self, user_message: str, target_language: str = "Korean", 
                          llm_provider: str = "groq", local_llm_url: Optional[str] = None,
                          chat_history: List[dict] = []) -> dict:
        
        structured_llm = self.get_llm(llm_provider, local_llm_url)
        system_prompt = f"""
        You are a helpful and expert {target_language} language teacher named Linguis. 
        The conversation is between you and a student learning {target_language}.
        
        Your goals:
        1. Respond naturally to the student's message in {target_language}. Keep the conversation engaging.
        2. If the student wrote in {target_language}, analyze their sentence for grammar, spelling, and naturalness.
        3. If the student wrote in English, respond in {target_language} but provide an English translation.
        4. Extract the most important vocabulary (2-4 words) and grammar points (1-2 patterns) from YOUR current response to help the student learn. 
        5. For vocabulary, focus on nouns, verbs, and adjectives used in YOUR response.
        6. For grammar, explain how the pattern works simply.
        
        Always provide:
        - The response in both {target_language} and English.
        - Detailed feedback if the user's input was in {target_language}.
        - A list of words and grammar patterns used in your response.
        - RELIABLE PRONUNCIATION GUIDES: For Chinese, provide Pinyin. For Japanese, provide Romaji/Hiragana. For Korean, provide Romanization.
        """
        
        if llm_provider == "local":
            system_prompt += "\n        CRITICAL: You must respond ONLY with a valid JSON object. Do not include any conversational filler or markdown markers like ```json."

        # Convert chat history to LangChain messages format
        messages = [("system", system_prompt)]
        for msg in chat_history[-10:]: # Look at last 10 messages
            role = "human" if msg["role"] == "user" else "assistant"
            messages.append((role, msg["content"]))
        
        messages.append(("human", user_message))
        
        prompt = ChatPromptTemplate.from_messages(messages)
        chain = prompt | structured_llm
        
        try:
            # Result is a dict when include_raw=True: {'raw': Message, 'parsed': AISystemResponse, 'parsing_error': ...}
            full_result = chain.invoke({})
            
            parsed = full_result.get('parsed')
            raw = full_result.get('raw')
            
            # Extract usage metadata
            usage = {}
            if raw and hasattr(raw, 'response_metadata'):
                usage = raw.response_metadata.get('token_usage', {})
                usage['model_name'] = raw.response_metadata.get('model_name', 'unknown')

            if parsed:
                return {"response": parsed, "usage": usage}
            
            if full_result.get('parsing_error'):
                raise full_result['parsing_error']
            
            raise Exception("Parsing failed but no error reported")
            
        except Exception as e:
            print(f"Error generating AI response: {str(e)}")
            # Fallback for local providers if structured output fails
            if llm_provider == "local":
                raw_llm = ChatOpenAI(
                    base_url=local_llm_url,
                    api_key="sk-not-needed",
                    model_name="local-model"
                )
                raw_chain = prompt | raw_llm
                raw_msg = raw_chain.invoke({})
                raw_output = raw_msg.content
                print(f"Raw response from local LLM: {raw_output}")
                
                clean_json = self._clean_json_string(raw_output)
                try:
                    import json
                    parsed_dict = json.loads(clean_json)
                    parsed = AISystemResponse(**parsed_dict)
                    
                    # Extract usage metadata from the raw call
                    usage = raw_msg.response_metadata.get('token_usage', {})
                    usage['model_name'] = raw_msg.response_metadata.get('model_name', 'local-model')
                    
                    return {"response": parsed, "usage": usage}
                except Exception as inner_e:
                    print(f"Failed to parse cleaned JSON: {str(inner_e)}")
                    raise e
            
            raise e
    def explain_snippet(self, text: str, target_language: str = "Korean", 
                       llm_provider: str = "groq", local_llm_url: Optional[str] = None) -> dict:
        
        structured_llm = self.get_llm(llm_provider, local_llm_url)
        system_prompt = f"""
        You are a helpful and expert {target_language} language teacher. 
        A student has selected a specific snippet from a {target_language} conversation and needs an explanation.
        
        Snippet: "{text}"
        
        Your goals:
        1. Break down the grammar patterns used in this specific snippet.
        2. Identify and define the key vocabulary words in this snippet.
        3. Keep explanations clear, simple, and encouraging.
        4. Focus ONLY on the content within the provided snippet.
        
        Always provide:
        - A list of grammar patterns found in the snippet.
        - A list of vocabulary words with meanings and pronunciation (Pinyin for Chinese, Romanization for Korean/Japanese).
        """
        
        if llm_provider == "local":
            system_prompt += "\n        CRITICAL: You must respond ONLY with a valid JSON object. Do not include any conversational filler or markdown markers like ```json."

        messages = [("system", system_prompt), ("human", f"Please explain this {target_language} snippet: {text}")]
        prompt = ChatPromptTemplate.from_messages(messages)
        chain = prompt | structured_llm
        
        try:
            full_result = chain.invoke({})
            parsed = full_result.get('parsed')
            
            if parsed:
                return {"grammar": parsed.grammar, "vocabulary": parsed.vocabulary}
            
            if full_result.get('parsing_error'):
                raise full_result['parsing_error']
            
            raise Exception("Parsing failed but no error reported")
            
        except Exception as e:
            print(f"Error explaining snippet: {str(e)}")
            # For brevity, let's just raise for now
            raise e
