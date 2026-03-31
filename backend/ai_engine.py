import os
from typing import List, Optional
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from backend.ai_models import WordInfo, GrammarInfo, FeedbackInfo, AISystemResponse, SuggestionResponse
from backend import prompts as ai_prompts

class AIEngine:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")

    def get_llm(self, provider: str = "groq", local_url: Optional[str] = None, output_model = AISystemResponse):
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
            return llm.with_structured_output(output_model, method="json_mode", include_raw=True)
        else:
            model_name = "llama-3.3-70b-versatile" if output_model == SuggestionResponse else "openai/gpt-oss-20b"
            llm = ChatGroq(
                model=model_name,
                temperature=0.7,
                api_key=self.groq_api_key
            )
        
        return llm.with_structured_output(output_model, include_raw=True)

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
                          chat_history: List[dict] = [], scenario: Optional[dict] = None) -> dict:
        
        structured_llm = self.get_llm(llm_provider, local_llm_url)
        
        if scenario:
            system_prompt = ai_prompts.get_roleplay_prompt(scenario, target_language, llm_provider)
        else:
            system_prompt = ai_prompts.get_system_prompt(target_language, llm_provider)

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
        
        structured_llm = self.get_llm(llm_provider, local_llm_url, output_model=AISystemResponse)
        system_prompt = ai_prompts.get_explanation_prompt(text, target_language, llm_provider)

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

    def get_suggestion(self, target_language: str = "Korean", 
                       llm_provider: str = "groq", local_llm_url: Optional[str] = None,
                       chat_history: List[dict] = []) -> dict:
        
        # Use a simpler prompt for suggestions
        llm_simple = self.get_llm(llm_provider, local_llm_url, output_model=SuggestionResponse)
        system_prompt = ai_prompts.get_suggestion_prompt(target_language, llm_provider)

        messages = [("system", system_prompt)]
        for msg in chat_history[-8:]: # Look at context
            role = "human" if msg["role"] == "user" else "assistant"
            messages.append((role, msg["content"]))
        
        messages.append(("human", "Help! I don't know what to say next. Suggest something for me."))
        
        prompt = ChatPromptTemplate.from_messages(messages)
        chain = prompt | llm_simple
        
        try:
            full_result = chain.invoke({})
            parsed = full_result.get('parsed')
            if parsed:
                return {"suggestion": parsed.suggestion, "translation": parsed.translation}
            
            # Fallback handling for messy outputs
            raw = full_result.get('raw')
            if raw and hasattr(raw, 'content'):
                clean_json = self._clean_json_string(raw.content)
                import json
                parsed_dict = json.loads(clean_json)
                return {"suggestion": parsed_dict.get("suggestion"), "translation": parsed_dict.get("translation")}
                
            raise Exception("No suggestion generated")
        except Exception as e:
            print(f"Error getting suggestion: {str(e)}")
            # Very simple hardcoded fallback
            return {
                "suggestion": "안녕하세요!" if target_language == "Korean" else "こんにちは!", 
                "translation": "Hello!"
            }
