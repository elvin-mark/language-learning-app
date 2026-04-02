import os
from typing import List, Optional
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

from backend.ai_models import WordInfo, GrammarInfo, FeedbackInfo, AISystemResponse, SuggestionResponse, ScenarioInfo, VariationInfo, WritingAssistantResponse
from backend import prompts as ai_prompts

class AIEngine:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")

    def get_llm(self, llm_type: str = "cloud", cloud_provider: str = "groq", 
                local_url: Optional[str] = None, output_model = AISystemResponse):
        
        if llm_type == "local" and local_url:
            llm = ChatOpenAI(
                base_url=local_url,
                api_key="sk-not-needed",
                temperature=0.7,
                model_name="local-model" 
            )
            return llm.with_structured_output(output_model, method="json_mode", include_raw=True)
        
        # Cloud Providers
        if cloud_provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                temperature=0.7,
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
        else: # Default to Groq
            llm = ChatGroq(
                model="llama-3.3-70b-versatile",
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
                          llm_type: str = "cloud", cloud_provider: str = "groq", 
                          local_llm_url: Optional[str] = None,
                          chat_history: List[dict] = [], scenario: Optional[dict] = None) -> dict:
        
        structured_llm = self.get_llm(llm_type, cloud_provider, local_llm_url)
        
        # Determine provider for prompt constraints
        prompt_provider = "local" if llm_type == "local" else cloud_provider
        
        if scenario:
            system_prompt = ai_prompts.get_roleplay_prompt(scenario, target_language, prompt_provider)
        else:
            system_prompt = ai_prompts.get_system_prompt(target_language, prompt_provider)

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
            if llm_type == "local":
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
                       llm_type: str = "cloud", cloud_provider: str = "groq", 
                       local_llm_url: Optional[str] = None) -> dict:
        
        structured_llm = self.get_llm(llm_type, cloud_provider, local_llm_url, output_model=AISystemResponse)
        prompt_provider = "local" if llm_type == "local" else cloud_provider
        system_prompt = ai_prompts.get_explanation_prompt(text, target_language, prompt_provider)

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
                       llm_type: str = "cloud", cloud_provider: str = "groq", 
                       local_llm_url: Optional[str] = None,
                       chat_history: List[dict] = []) -> dict:
        
        # Use a simpler prompt for suggestions
        llm_simple = self.get_llm(llm_type, cloud_provider, local_llm_url, output_model=SuggestionResponse)
        prompt_provider = "local" if llm_type == "local" else cloud_provider
        system_prompt = ai_prompts.get_suggestion_prompt(target_language, prompt_provider)

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

    async def generate_scenario(self, topic: str, target_language: str, 
                                llm_type: str = "cloud", cloud_provider: str = "groq", 
                                local_llm_url: Optional[str] = None) -> dict:
        """Generates a full roleplay scenario from a topic."""
        structured_llm = self.get_llm(llm_type, cloud_provider, local_llm_url, output_model=ScenarioInfo)
        prompt_provider = "local" if llm_type == "local" else cloud_provider
        prompt = ai_prompts.get_scenario_generation_prompt(topic, target_language, prompt_provider)
        
        try:
            raw_msg = await structured_llm.ainvoke(prompt)
            # handle the include_raw=True format
            if isinstance(raw_msg, dict) and "parsed" in raw_msg:
                return raw_msg["parsed"].dict()
            
            # fallback if it's already parsed
            if hasattr(raw_msg, "dict"):
                return raw_msg.dict()
            
            raise Exception("AI failed to return valid structured scenario")
        except Exception as e:
            print(f"Error generating scenario: {str(e)}")
            # Fallback to a generic coffee shop if everything fails
            return {
                "id": f"gen-{int(os.times()[4])}",
                "name": f"Practice: {topic[:20]}",
                "description": f"A scenario about {topic}.",
                "role": "Conversation Partner",
                "goal": "Communicate naturally about the topic.",
                "objectives": ["Introduce yourself", "Ask one question", "Say something positive"],
                "initial_message": "안녕하세요! 만나서 반가워요." if target_language == "Korean" else "こんにちは！よろしくお願いします。",
                "difficulty": "Intermediate"
            }

    async def get_writing_assistant(self, text: str, target_language: str, scenario: Optional[dict] = None,
                                   llm_type: str = "cloud", cloud_provider: str = "groq", 
                                   local_llm_url: Optional[str] = None) -> dict:
        """Generates 3 variations of a user intent (Formal, Casual, Natural)."""
        structured_llm = self.get_llm(llm_type, cloud_provider, local_llm_url, output_model=WritingAssistantResponse)
        prompt_text = ai_prompts.get_writing_assistant_prompt(text, target_language, scenario)
        
        try:
            # Use ChatPromptTemplate for consistency
            messages = [("system", prompt_text), ("human", f"Variations for: {text}")]
            prompt = ChatPromptTemplate.from_messages(messages)
            chain = prompt | structured_llm
            
            full_result = await chain.ainvoke({})
            # Handle the include_raw=True format
            parsed = full_result.get('parsed')
            
            if parsed:
                return parsed.dict()
            
            # Fallback if parsing fails but content exists
            raw = full_result.get('raw')
            if raw and hasattr(raw, 'content'):
                clean_json = self._clean_json_string(raw.content)
                import json
                parsed_dict = json.loads(clean_json)
                return parsed_dict

            raise Exception("AI failed to return valid variations")
        except Exception as e:
            print(f"Error getting writing assistant suggestions: {str(e)}")
            # Minimalist fallback
            return {
                "variations": [
                    {"label": "Natural", "text": text, "explanation": "Failed to generate variations. Using original."}
                ]
            }

    async def generate_reading_task(self, topic: str, target_language: str, difficulty: str,
                                   llm_type: str = "cloud", cloud_provider: str = "groq", 
                                   local_llm_url: Optional[str] = None) -> dict:
        """Generates a reading passage with multiple-choice questions."""
        from backend.ai_models import ReadingPassageInfo
        structured_llm = self.get_llm(llm_type, cloud_provider, local_llm_url, output_model=ReadingPassageInfo)
        prompt_provider = "local" if llm_type == "local" else cloud_provider
        prompt_text = ai_prompts.get_reading_generation_prompt(topic, target_language, difficulty, prompt_provider)
        
        try:
            full_result = await structured_llm.ainvoke(prompt_text)
            
            # handle the include_raw=True format
            parsed = full_result.get('parsed')
            if parsed:
                return parsed.dict()
            
            # fallback if it failed to parse correctly but we have raw content
            raw = full_result.get('raw')
            if raw and hasattr(raw, 'content'):
                clean_json = self._clean_json_string(raw.content)
                import json
                parsed_dict = json.loads(clean_json)
                return parsed_dict
            
            raise Exception("AI failed to return valid reading task")
        except Exception as e:
            print(f"Error generating reading task: {str(e)}")
            raise e
