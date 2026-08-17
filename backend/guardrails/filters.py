from backend.services.llm import classify_query_intent
import logging

logger = logging.getLogger(__name__)

class InputGuardrail:
    @staticmethod
    async def validate(query: str) -> bool:
        """
        Validates the input query. Returns True if the query is safe and a valid question.
        Returns False if it is a greeting, out-of-topic, or unsafe.
        """
        try:
            intent = await classify_query_intent(query)
            
            is_safe = intent.get("is_safe", True)
            is_question = intent.get("is_question", True)
            reason = intent.get("reason", "")
            
            if not is_safe:
                logger.warning(f"Guardrail triggered (Unsafe): {reason}")
                return False
                
            if not is_question:
                logger.info(f"Guardrail triggered (Not a question): {reason}")
                return False
                
            return True
            
        except Exception as e:
            logger.error(f"InputGuardrail classification failed: {e}")
            # If the classifier fails, we default to allowing it to prevent blocking the pipeline
            return True
