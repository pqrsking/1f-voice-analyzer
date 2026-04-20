from fastapi import APIRouter
from schemas import ConceptTranslateRequest, ConceptTranslateResponse
from services.translator import translate_concept

router = APIRouter(prefix="/api/v1/translate", tags=["translation"])


@router.post("/concept", response_model=ConceptTranslateResponse)
def concept_translate(req: ConceptTranslateRequest):
    result = translate_concept(req.text, req.source_lang, req.target_lang)
    return ConceptTranslateResponse(
        translated_text=result.get("translated_text", req.text),
        extracted_concepts=result.get("extracted_concepts", []),
        clarification_needed=result.get("clarification_needed", False),
    )
