from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional

JsonDict = Dict[str, Any]


class OpenAILLM:
    """
    Minimal OpenAI Responses API wrapper that returns parsed JSON.

    IMPORTANT for Cloudflare/Pyodide:
    - Do not instantiate this at module import time.
    - Create it only inside a request/function call.
    """

    def __init__(
        self,
        model: str = "gpt-5.2",
        temperature: float = 0.0,
        max_retries: int = 3,
    ) -> None:
        from openai import OpenAI

        self.client = OpenAI()
        self.model = model
        self.temperature = temperature
        self.max_retries = max_retries

    @staticmethod
    def _extract_json(text: str) -> JsonDict:
        text = text.strip()
        text = re.sub(r"```json", "", text, flags=re.IGNORECASE)
        text = re.sub(r"```", "", text)

        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in model output.")
        return json.loads(match.group(0))

    def __call__(self, system_prompt: str, user_prompt: str) -> JsonDict:
        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries):
            try:
                response = self.client.responses.create(
                    model=self.model,
                    temperature=self.temperature,
                    input=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                )
                return self._extract_json(response.output_text)
            except Exception as exc:
                last_error = exc
                if attempt == self.max_retries - 1:
                    break
                time.sleep(1.0)

        raise RuntimeError(f"LLM call failed after {self.max_retries} attempts: {last_error}")


@dataclass
class Turn:
    text: str


def get_phase_patterns() -> Dict[str, List[str]]:
    return {
        "clarifying": [
            r"\bconstraints?\b",
            r"\bedge cases?\b",
            r"\binput\b",
            r"\boutput\b",
            r"\bwhat if\b",
            r"\bassume\b",
            r"\bguaranteed\b",
            r"\bnull\b",
            r"\bempty\b",
            r"\bduplicates?\b",
            r"\brange\b",
            r"\blimits?\b",
            r"\bthe problem is\b",
            r"\bwe need to\b",
            r"\bthe goal is\b",
            r"\bso we want to\b",
        ],
        "approach": [
            r"\bidea\b",
            r"\bapproach\b",
            r"\bplan\b",
            r"\bstrategy\b",
            r"\bwe can\b",
            r"\bi think\b",
            r"\blet's\b",
            r"\b(two pointers|hash map|hashmap|stack|queue|bfs|dfs|dp|dynamic programming|greedy|binary search|heap|priority queue|union find|trie)\b",
        ],
        "coding": [
            r"\blet me (code|implement|write)\b",
            r"\bi('ll| will) (code|implement|write)\b",
            r"\bwriting (the )?code\b",
            r"\bfunction\b",
            r"\bclass\b",
            r"\breturn\b",
            r"\binitialize\b",
            r"\bloop\b",
        ],
        "complexity": [
            r"\bO\(",
            r"\bbig[- ]o\b",
            r"\btime complexity\b",
            r"\bspace complexity\b",
            r"\blinear\b",
            r"\bconstant\b",
            r"\bn log n\b",
            r"\blogarithmic\b",
        ],
        "testing": [
            r"\btest\b",
            r"\btest case\b",
            r"\bdry run\b",
            r"\bwalk through\b",
            r"\bexample\b",
            r"\btry this\b",
            r"\bdebug\b",
            r"\bbug\b",
            r"\berror\b",
            r"\bfix\b",
            r"\bwhy is\b",
            r"\bwhy does\b",
        ],
    }


def split_transcript_blocks(transcript: str) -> List[Turn]:
    if transcript is None:
        return []

    text = str(transcript).replace("\r\n", "\n").replace("\\n", "\n").strip()
    if not text:
        return []

    blocks = [b.strip() for b in re.split(r"\n\s*\n+", text) if b.strip()]
    if not blocks:
        return [Turn(text=text)]

    return [Turn(text=b) for b in blocks]


def classify_block(text: str) -> str:
    tx = text.lower()
    scores: Dict[str, float] = {}

    def add_score(label: str, amount: float) -> None:
        scores[label] = scores.get(label, 0.0) + amount

    if "?" in text:
        add_score("clarifying", 0.8 * text.count("?"))
        add_score("testing", 0.2 * text.count("?"))

    for phase, patterns in get_phase_patterns().items():
        for pattern in patterns:
            hits = len(re.findall(pattern, tx))
            if hits:
                add_score(phase, float(hits))

    code_like = len(re.findall(r"\bdef\b|\bclass\b|\breturn\b|==|!=|<=|>=|\{|\}|\[|\]", text))
    if code_like >= 3:
        add_score("coding", 2.5)

    if not scores:
        return "other"

    label, value = max(scores.items(), key=lambda item: item[1])
    return label if value >= 1.0 else "other"


def smooth_labels(labels: List[str], window: int = 1) -> List[str]:
    if not labels:
        return []

    out: List[str] = []
    for i in range(len(labels)):
        lo = max(0, i - window)
        hi = min(len(labels), i + window + 1)
        window_vals = labels[lo:hi]
        out.append(max(set(window_vals), key=window_vals.count))
    return out


def assign_section(label: str) -> int:
    if label == "clarifying":
        return 1
    if label == "approach":
        return 2
    if label == "coding":
        return 3
    if label == "complexity":
        return 4
    if label == "testing":
        return 5
    return 0


def bundle_sections(transcript: str) -> Dict[str, str]:
    turns = split_transcript_blocks(transcript)
    if not turns:
        return {f"section_{i}": "" for i in range(1, 6)}

    raw_labels = [classify_block(t.text) for t in turns]
    labels = smooth_labels(raw_labels, window=1)

    sections = {i: [] for i in range(1, 6)}
    leftovers: List[str] = []

    for turn, label in zip(turns, labels):
        sec = assign_section(label)
        if sec == 0:
            leftovers.append(turn.text)
        else:
            sections[sec].append(turn.text)

    for text in leftovers:
        text_lower = text.lower()
        if any(token in text_lower for token in ["test", "example", "dry run", "walk through", "bug", "fix"]):
            sections[5].append(text)
        elif any(token in text_lower for token in ["o(", "time complexity", "space complexity", "linear", "constant"]):
            sections[4].append(text)
        elif any(token in text_lower for token in ["def ", "class ", "return", "for ", "while ", "if "]):
            sections[3].append(text)
        elif any(token in text_lower for token in ["idea", "approach", "plan", "strategy", "hash map", "two pointers", "binary search", "dfs", "bfs", "dp"]):
            sections[2].append(text)
        else:
            sections[1].append(text)

    return {f"section_{i}": "\n\n".join(sections[i]).strip() for i in range(1, 6)}


def add_line_numbers(code: str) -> str:
    lines = str(code).splitlines()
    if not lines:
        return "1: "
    width = len(str(len(lines)))
    return "\n".join(f"{str(i + 1).rjust(width)}: {line}" for i, line in enumerate(lines))


def get_single_pass_system_prompt() -> str:
    return """
You are an honest, fair, and consistent technical interview coach.

You are evaluating an ENTRY-LEVEL Software Engineering LeetCode-style interview.

Important context:
- There is only one human role: the interviewee.
- Any prompts, instructions, or follow-up questions came from an on-screen system, not a second person.
- Do not infer interviewer skill, interviewer guidance, or dialogue quality from a second speaker.
- Evaluate only the interviewee's reasoning, communication, and submitted code.

You will receive:
- The interview transcript split into 5 sections
- Final code from the interviewee
- The problem statement
- Constraints
- Programming language

Score strictly using this rubric:

Communication Skills
1 = Poor: disorganized or unclear, little verbalization
2 = Fair: some explanation, but inconsistent or vague
3 = Good: generally clear and structured, explains reasoning and intent
4 = Excellent: very clear and concise, states what they are about to solve before solving it

Problem-Solving Skills
1 = Poor: no coherent strategy, unable to recover from confusion
2 = Fair: partial or inefficient approach, needs significant guidance
3 = Good: reasonable and correct approach, handles most cases
4 = Excellent: strong conceptual understanding, anticipates issues and debugs logically

Coding
1 = Poor: code does not reflect a workable solution or is largely incoherent
2 = Fair: partial implementation or significant issues, but some correct structure exists
3 = Good: reasonable implementation that mostly matches the approach and is interview-passable
4 = Excellent: clear, correct, and well-structured implementation for the entry-level bar

Pass / Fail rule:
PASS if and only if all are true:
- Communication >= 3
- Ps >= 3
- code >= 3
Otherwise FAIL.

Guidelines:
- Grade the code directly from the final code shown.
- Use the transcript sections and code together.
- Be conservative and fair.
- Do not nitpick small syntax issues.
- Do not invent missing behaviors.
- Do not over-penalize awkward phrasing caused by speaking to a screen.
- If the transcript contains system prompts or auto-generated text, treat them as context, not as evidence of candidate communication skill.

Written feedback requirements:
Use EXACTLY this structure:
"You did really well at [3 specific strengths].\n\nThere’s room to improve your [2 specific, personalized areas to improve based on what they did].\n\nActionable step(s) you can take to improve your weak points are [specific actions they can take to improve their weak points. More practice does not count.]"

Return ONLY valid JSON with exactly these keys:
{
  "Communication": <integer 1-4>,
  "Communication_reason": "<150 chars max>",
  "Ps": <integer 1-4>,
  "Ps_reason": "<150 chars max>",
  "code": <integer 1-4>,
  "code_reason": "<150 chars max>",
  "Pass": <true | false>,
  "overall_takeaway": "You did really well at ...\n\nThere’s room to improve your ...\n\nActionable step(s) you can take to improve your weak points are ..." (925 characters max)
}

No markdown.
No extra text.
""".strip()


def build_single_pass_user_prompt(
    problem_statement: str,
    constraints: str,
    language: str,
    code: str,
    transcript_sections: Dict[str, str],
) -> str:
    numbered_code = add_line_numbers(code)
    return f"""
Evaluate this interview in one pass.

Reminder:
- The transcript comes from one interviewee interacting with an on-screen prompt.
- Do not treat this as a two-person conversation.
- Focus on the interviewee's communication, reasoning, debugging, and code quality.

[PROBLEM]
{problem_statement}

[CONSTRAINTS]
{constraints}

[LANGUAGE]
{language}

[FINAL CODE WITH LINE NUMBERS]
{numbered_code}

[SECTION 1: CLARIFYING QUESTIONS AND INITIAL REASONING]
{transcript_sections.get('section_1', '')}

[SECTION 2: HIGH-LEVEL APPROACH]
{transcript_sections.get('section_2', '')}

[SECTION 3: CODING DISCUSSION]
{transcript_sections.get('section_3', '')}

[SECTION 4: COMPLEXITY DISCUSSION]
{transcript_sections.get('section_4', '')}

[SECTION 5: TESTING AND DEBUGGING]
{transcript_sections.get('section_5', '')}
""".strip()


def _require_keys(obj: JsonDict, keys: List[str]) -> None:
    missing = [k for k in keys if k not in obj]
    if missing:
        raise ValueError(f"Missing required keys: {missing}")


def _ensure_score(name: str, value: Any) -> None:
    if not isinstance(value, int):
        raise ValueError(f"{name} must be an integer.")
    if value < 1 or value > 4:
        raise ValueError(f"{name} must be between 1 and 4. Got: {value}")


def _ensure_str(name: str, value: Any, max_len: Optional[int] = None) -> None:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string.")
    if max_len is not None and len(value) > max_len:
        raise ValueError(f"{name} exceeds max length {max_len}. Got {len(value)} chars.")


def validate_single_pass_result(result: JsonDict) -> None:
    required = [
        "Communication",
        "Communication_reason",
        "Ps",
        "Ps_reason",
        "code",
        "code_reason",
        "Pass",
        "overall_takeaway",
    ]
    _require_keys(result, required)

    _ensure_score("Communication", result["Communication"])
    _ensure_score("Ps", result["Ps"])
    _ensure_score("code", result["code"])
    _ensure_str("Communication_reason", result["Communication_reason"], 150)
    _ensure_str("Ps_reason", result["Ps_reason"], 150)
    _ensure_str("code_reason", result["code_reason"], 150)
    _ensure_str("overall_takeaway", result["overall_takeaway"], 1000)

    if not isinstance(result["Pass"], bool):
        raise ValueError("Pass must be a boolean.")

    expected_pass = (
        result["Communication"] >= 3
        and result["Ps"] >= 3
        and result["code"] >= 3
    )
    if result["Pass"] != expected_pass:
        raise ValueError(
            f"Pass flag violates rubric rules. Expected {expected_pass}, got {result['Pass']}."
        )

    feedback = result["overall_takeaway"]
    if not feedback.startswith("You did really well at "):
        raise ValueError("overall_takeaway must start with 'You did really well at ...'")
    if "There’s room to improve your " not in feedback and "There's room to improve your " not in feedback:
        raise ValueError("overall_takeaway must contain the required improvement sentence.")


class SinglePassInterviewEvaluator:
    def __init__(self, llm_callable: Callable[[str, str], JsonDict]) -> None:
        self.llm = llm_callable

    def section_transcript(self, transcript: str) -> Dict[str, str]:
        return bundle_sections(transcript)

    def evaluate(
        self,
        transcript: str,
        code: str,
        problem_statement: str,
        constraints: str,
        language: str,
    ) -> JsonDict:
        sections = self.section_transcript(transcript)
        system_prompt = get_single_pass_system_prompt()
        user_prompt = build_single_pass_user_prompt(
            problem_statement=problem_statement,
            constraints=constraints,
            language=language,
            code=code,
            transcript_sections=sections,
        )
        result = self.llm(system_prompt, user_prompt)
        validate_single_pass_result(result)
        return result


def evaluate_interview(
    transcript: str,
    code: str,
    problem_statement: str,
    constraints: str,
    language: str,
    model: str = "gpt-5.2",
) -> JsonDict:
    llm = OpenAILLM(model=model)
    evaluator = SinglePassInterviewEvaluator(llm)
    return evaluator.evaluate(
        transcript=transcript,
        code=code,
        problem_statement=problem_statement,
        constraints=constraints,
        language=language,
    )

# if __name__ == "__main__":
#     # --------------------------------------------------
#     # TEST CASE 1: Strong Candidate / Should Pass
#     # --------------------------------------------------
#     transcript_1 = """
#     First, I want to clarify whether duplicates are allowed and whether the input can be empty.

#     My idea is to use a hash map to store seen values as I iterate through the array.

#     I'll loop through the array once. For each number, I'll calculate the complement and check if it's already in the map.

#     The time complexity is O(n) because we only iterate once, and the space complexity is O(n) because of the hash map.

#     Let me test it with [2, 7, 11, 15] and target 9. I see 2 first, then when I get to 7, the complement is 2 which is already in the map, so I return [0, 1].
#     """

#     code_1 = """
# def twoSum(nums, target):
#     seen = {}

#     for i, num in enumerate(nums):
#         complement = target - num
#         if complement in seen:
#             return [seen[complement], i]
#         seen[num] = i

#     return []
# """

#     result_1 = evaluate_interview(
#         transcript=transcript_1,
#         code=code_1,
#         problem_statement="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
#         constraints="Exactly one valid answer exists. Do not use the same element twice.",
#         language="Python"
#     )

#     print("\\n===== TEST CASE 1 =====")
#     print(json.dumps(result_1, indent=2))

#     # --------------------------------------------------
#     # TEST CASE 2: Weak Candidate / Should Fail
#     # --------------------------------------------------
#     transcript_2 = """
#     I think maybe I would just use loops.

#     I am not really sure if duplicates matter.

#     I guess I could compare every pair.

#     The complexity is probably O(n).

#     I would test it with some numbers.
#     """

#     code_2 = """
# def twoSum(nums, target):
#     for i in range(len(nums)):
#         for j in range(len(nums)):
#             if nums[i] + nums[j] == target:
#                 return [i, j]
# """

#     result_2 = evaluate_interview(
#         transcript=transcript_2,
#         code=code_2,
#         problem_statement="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
#         constraints="Exactly one valid answer exists. Do not use the same element twice.",
#         language="Python"
#     )

#     print("\\n===== TEST CASE 2 =====")
#     print(json.dumps(result_2, indent=2))

#     # --------------------------------------------------
#     # TEST CASE 3: Mixed Candidate / Borderline
#     # --------------------------------------------------
#     transcript_3 = """
#     The goal is to determine whether a string has balanced parentheses.

#     I think we can use a stack for this because we want to match opening and closing brackets.

#     I'll push opening brackets onto the stack and pop when I see a closing bracket.

#     The time complexity is O(n) and the space complexity is O(n) in the worst case.

#     Let me test it with '()[]{}'. That should return true.

#     If I test it with '(]', then I push '(' but the next character is ']' which does not match, so I should return false.
#     """

#     code_3 = """
# def isValid(s):
#     stack = []
#     pairs = {
#         ')': '(',
#         ']': '[',
#         '}': '{'
#     }

#     for char in s:
#         if char in pairs.values():
#             stack.append(char)
#         elif char in pairs:
#             if not stack or stack.pop() != pairs[char]:
#                 return False

#     return len(stack) == 0
# """

#     result_3 = evaluate_interview(
#         transcript=transcript_3,
#         code=code_3,
#         problem_statement="Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
#         constraints="An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
#         language="Python"
#     )

#     print("\\n===== TEST CASE 3 =====")
#     print(json.dumps(result_3, indent=2))