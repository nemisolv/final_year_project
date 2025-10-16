#!/usr/bin/env python3
"""
Standalone test script để verify confidence score calculation
Không cần dependencies
"""
from difflib import SequenceMatcher

class MockMatch:
    """Mock LanguageTool match object"""
    def __init__(self, category, replacements, matched_text):
        self.category = category
        self.replacements = replacements
        self.matchedText = matched_text

def calculate_confidence_score(match):
    """
    Replica của _calculate_confidence_score từ grammar_service.py
    """
    HIGH_CONFIDENCE_CATEGORIES = {'TYPOS', 'CASING', 'PUNCTUATION'}
    MEDIUM_CONFIDENCE_CATEGORIES = {'GRAMMAR', 'CONFUSED_WORDS', 'REDUNDANCY'}

    score = 0.0

    # 1. Category confidence (40 điểm)
    if match.category in HIGH_CONFIDENCE_CATEGORIES:
        score += 40
    elif match.category in MEDIUM_CONFIDENCE_CATEGORIES:
        score += 25
    else:
        score += 10

    # 2. Số lượng suggestions (30 điểm)
    if match.replacements:
        num_suggestions = len(match.replacements)
        if num_suggestions == 1:
            score += 30
        elif num_suggestions <= 3:
            score += 20
        else:
            score += 10
    else:
        score += 0

    # 3. Độ tương đồng (20 điểm)
    if match.replacements:
        if match.matchedText and match.replacements[0]:
            similarity = SequenceMatcher(None, match.matchedText.lower(),
                                       match.replacements[0].lower()).ratio()
            score += similarity * 20
        else:
            score += 15  # Không xác định được, cho điểm khá
    else:
        score += 0  # Không có suggestion

    # 4. Issue type priority (10 điểm)
    if match.category in ['TYPOS', 'GRAMMAR']:
        score += 8
    else:
        score += 5

    return min(score, 100.0)

def main():
    THRESHOLD = 70.0

    print("=" * 80)
    print("GRAMMAR CONFIDENCE SCORE TESTING")
    print("=" * 80)
    print(f"\nThreshold: {THRESHOLD}\n")

    # Test cases
    test_cases = [
        {
            "name": "Simple Typo: 'teh' → 'the'",
            "match": MockMatch("TYPOS", ["the"], "teh"),
            "expected": ">= 70"
        },
        {
            "name": "Spelling: 'recieve' → 'receive'",
            "match": MockMatch("TYPOS", ["receive"], "recieve"),
            "expected": ">= 70"
        },
        {
            "name": "Casing: 'hello' → 'Hello'",
            "match": MockMatch("CASING", ["Hello"], "hello"),
            "expected": ">= 70"
        },
        {
            "name": "Grammar with 2 suggestions",
            "match": MockMatch("GRAMMAR", ["is", "was"], "are"),
            "expected": "~70"
        },
        {
            "name": "Grammar with 5 suggestions",
            "match": MockMatch("GRAMMAR", ["could be", "might be", "would be", "should be", "can be"], "is"),
            "expected": "< 70"
        },
        {
            "name": "Style issue: 'very very' → alternatives",
            "match": MockMatch("STYLE", ["extremely", "really"], "very very"),
            "expected": "< 70"
        },
        {
            "name": "No suggestions available",
            "match": MockMatch("GRAMMAR", [], "irregardless"),
            "expected": "< 70"
        },
        {
            "name": "Confused words: 'effect' → 'affect'",
            "match": MockMatch("CONFUSED_WORDS", ["affect"], "effect"),
            "expected": "~70"
        },
        {
            "name": "Punctuation missing comma",
            "match": MockMatch("PUNCTUATION", [","], "."),
            "expected": ">= 70"
        },
        {
            "name": "Semantic issue",
            "match": MockMatch("SEMANTICS", ["appropriate", "suitable"], "good"),
            "expected": "< 70"
        },
    ]

    results = []

    for i, test_case in enumerate(test_cases, 1):
        match = test_case["match"]
        score = calculate_confidence_score(match)

        decision = "✅ Use LanguageTool" if score >= THRESHOLD else "⚠️ Escalate to LLM"

        print(f"{i}. {test_case['name']}")
        print(f"   Category: {match.category}")
        print(f"   Suggestions: {len(match.replacements)} - {match.replacements[:3]}")
        print(f"   Score: {score:.1f}/100")
        print(f"   Expected: {test_case['expected']}")
        print(f"   Decision: {decision}")
        print()

        results.append({
            "name": test_case["name"],
            "score": score,
            "decision": decision,
        })

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)

    languagetool_cases = sum(1 for r in results if "LanguageTool" in r["decision"])
    llm_cases = sum(1 for r in results if "LLM" in r["decision"])
    total = len(results)

    print(f"\nDecision Distribution:")
    print(f"  ✅ LanguageTool only: {languagetool_cases}/{total} ({languagetool_cases/total*100:.1f}%)")
    print(f"  ⚠️  Escalate to LLM:   {llm_cases}/{total} ({llm_cases/total*100:.1f}%)")

    print(f"\nScore Statistics:")
    scores = [r['score'] for r in results]
    print(f"  Min score:  {min(scores):.1f}")
    print(f"  Max score:  {max(scores):.1f}")
    print(f"  Mean score: {sum(scores)/len(scores):.1f}")

    print(f"\nThreshold: {THRESHOLD}")
    print("=" * 80)

    # Show which cases use LanguageTool vs LLM
    print("\n📊 ANALYSIS:")
    print("\nLanguageTool handles:")
    for r in results:
        if "LanguageTool" in r["decision"]:
            print(f"  • {r['name']} (score: {r['score']:.1f})")

    print("\nLLM escalation needed:")
    for r in results:
        if "LLM" in r["decision"]:
            print(f"  • {r['name']} (score: {r['score']:.1f})")

if __name__ == "__main__":
    main()
