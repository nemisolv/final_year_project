#!/usr/bin/env python3
"""
Test script để verify confidence score calculation
"""
import sys
sys.path.insert(0, '/mnt/data/workspace/personal-coding/final_year_project/ai-service')

from app.services.grammar_service import GrammarService
from difflib import SequenceMatcher

class MockMatch:
    """Mock LanguageTool match object for testing"""
    def __init__(self, category, replacements, matched_text, rule_id="TEST"):
        self.category = category
        self.replacements = replacements
        self.matchedText = matched_text
        self.ruleId = rule_id
        self.offset = 0
        self.errorLength = len(matched_text)
        self.message = f"Test error for {matched_text}"

def test_confidence_calculation():
    """Test các scenarios khác nhau"""
    service = GrammarService()

    print("=" * 80)
    print("GRAMMAR CONFIDENCE SCORE TESTING")
    print("=" * 80)
    print(f"\nThreshold: {service.CONFIDENCE_THRESHOLD}\n")

    # Test cases
    test_cases = [
        {
            "name": "Simple Typo (1 suggestion)",
            "match": MockMatch("TYPOS", ["the"], "teh"),
            "expected": ">= 70 (Use LanguageTool)"
        },
        {
            "name": "Spelling Error (1 suggestion, high similarity)",
            "match": MockMatch("TYPOS", ["receive"], "recieve"),
            "expected": ">= 70 (Use LanguageTool)"
        },
        {
            "name": "Casing Error",
            "match": MockMatch("CASING", ["Hello"], "hello"),
            "expected": ">= 70 (Use LanguageTool)"
        },
        {
            "name": "Grammar with 2 suggestions",
            "match": MockMatch("GRAMMAR", ["is", "was"], "are"),
            "expected": "~70 (Borderline)"
        },
        {
            "name": "Grammar with many suggestions (4+)",
            "match": MockMatch("GRAMMAR", ["could be", "might be", "would be", "should be", "can be"], "is"),
            "expected": "< 70 (Use LLM)"
        },
        {
            "name": "Style issue with low similarity",
            "match": MockMatch("STYLE", ["extremely", "really"], "very very"),
            "expected": "< 70 (Use LLM)"
        },
        {
            "name": "No suggestions",
            "match": MockMatch("GRAMMAR", [], "irregardless"),
            "expected": "< 70 (Use LLM)"
        },
        {
            "name": "Confused words",
            "match": MockMatch("CONFUSED_WORDS", ["affect"], "effect"),
            "expected": "~70 (Borderline)"
        },
        {
            "name": "Punctuation error",
            "match": MockMatch("PUNCTUATION", [","], ""),
            "expected": ">= 70 (Use LanguageTool)"
        },
        {
            "name": "Semantic issue",
            "match": MockMatch("SEMANTICS", ["appropriate", "suitable"], "good"),
            "expected": "< 70 (Use LLM)"
        },
    ]

    results = []

    for i, test_case in enumerate(test_cases, 1):
        match = test_case["match"]
        score = service._calculate_confidence_score(match)

        # Breakdown components
        category_score = 0
        if match.category in service.HIGH_CONFIDENCE_CATEGORIES:
            category_score = 40
        elif match.category in service.MEDIUM_CONFIDENCE_CATEGORIES:
            category_score = 25
        else:
            category_score = 10

        suggestion_score = 0
        if match.replacements:
            num = len(match.replacements)
            if num == 1:
                suggestion_score = 30
            elif num <= 3:
                suggestion_score = 20
            else:
                suggestion_score = 10

        similarity_score = 0
        if match.replacements and match.matchedText:
            sim = SequenceMatcher(None, match.matchedText.lower(), match.replacements[0].lower()).ratio()
            similarity_score = sim * 20

        issue_type_score = 8 if match.category in ['TYPOS', 'GRAMMAR'] else 5

        decision = "✅ Use LanguageTool" if score >= service.CONFIDENCE_THRESHOLD else "⚠️ Escalate to LLM"

        print(f"\n{i}. {test_case['name']}")
        print(f"   Category: {match.category}, Suggestions: {len(match.replacements)}")
        print(f"   Breakdown:")
        print(f"     - Category:    {category_score:5.1f} pts")
        print(f"     - Suggestions: {suggestion_score:5.1f} pts")
        print(f"     - Similarity:  {similarity_score:5.1f} pts")
        print(f"     - Issue Type:  {issue_type_score:5.1f} pts")
        print(f"   Total Score:    {score:5.1f}/100")
        print(f"   Expected:       {test_case['expected']}")
        print(f"   Decision:       {decision}")

        results.append({
            "name": test_case["name"],
            "score": score,
            "decision": decision,
            "meets_expectation": (score >= service.CONFIDENCE_THRESHOLD and ">= 70" in test_case['expected']) or
                                (score < service.CONFIDENCE_THRESHOLD and "< 70" in test_case['expected'])
        })

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    correct = sum(1 for r in results if r["meets_expectation"])
    total = len(results)

    print(f"\nTest Results: {correct}/{total} cases behaved as expected")

    languagetool_cases = sum(1 for r in results if "LanguageTool" in r["decision"])
    llm_cases = sum(1 for r in results if "LLM" in r["decision"])

    print(f"\nDecision Distribution:")
    print(f"  ✅ LanguageTool only: {languagetool_cases}/{total} ({languagetool_cases/total*100:.1f}%)")
    print(f"  ⚠️  Escalate to LLM:   {llm_cases}/{total} ({llm_cases/total*100:.1f}%)")

    print(f"\nThreshold Analysis:")
    print(f"  Current threshold: {service.CONFIDENCE_THRESHOLD}")
    print(f"  Score range: {min(r['score'] for r in results):.1f} - {max(r['score'] for r in results):.1f}")

    if correct == total:
        print("\n✅ All test cases passed! Logic is working as expected.")
    else:
        print(f"\n⚠️ {total - correct} test case(s) did not match expectations. Review needed.")

    print("\n" + "=" * 80)

if __name__ == "__main__":
    test_confidence_calculation()
