from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Tuple

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
                text = response.output_text
                return self._extract_json(text)

            except Exception as exc:
                last_error = exc
                if attempt == self.max_retries - 1:
                    break
                time.sleep(1.0)

        raise RuntimeError(f"LLM call failed after {self.max_retries} attempts: {last_error}")


def get_speaker_inline_re() -> re.Pattern[str]:
    return re.compile(r"(?:(?<=\n)|^|(?<=\s))([A-Z][A-Za-z0-9' \-]{1,60}):\s")


def get_code_hint_re() -> re.Pattern[str]:
    return re.compile(
        r"(\bdef\b|\bclass\b|\breturn\b|==|!=|<=|>=|\{|\}|\[|\]|;|->|=>|"
        r"\bpublic\b|\bstatic\b|\bvoid\b|\bint\b|\bString\b|\bprintln\b|\bconsole\.log\b)"
    )


def get_phase_patterns() -> Dict[str, List[str]]:
    return {
        "warmup": [
            r"\bhello\b",
            r"\bhi\b",
            r"\bhow are you\b",
            r"\bnice to meet\b",
            r"\bthanks for (joining|signing up)\b",
        ],
        "problem_recap": [
            r"\bso (the )?problem is\b",
            r"\bwe('re| are) given\b",
            r"\bwe need to\b",
            r"\bthe goal is\b",
            r"\bwe want to\b",
            r"\bin other words\b",
            r"\brestate\b",
        ],
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
        ],
        "approach": [
            r"\bidea\b",
            r"\bapproach\b",
            r"\bplan\b",
            r"\bstrategy\b",
            r"\bwe can\b",
            r"\bi think we\b",
            r"\blet's\b",
            r"\b(two pointers|hash map|hashmap|stack|queue|bfs|dfs|dp|dynamic programming|greedy|binary search|heap|priority queue|union find|trie)\b",
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
        "debug": [
            r"\bdebug\b",
            r"\bbug\b",
            r"\berror\b",
            r"\bexception\b",
            r"\bfail(s|ed)?\b",
            r"\bdoes(n't| not)\b work\b",
            r"\boff[- ]by[- ]one\b",
            r"\bfix\b",
            r"\bwhy is\b",
            r"\bwhy does\b",
        ],
        "testing": [
            r"\btest\b",
            r"\btest case\b",
            r"\bdry run\b",
            r"\bwalk through\b",
            r"\bexample\b",
            r"\btry this\b",
        ],
        "wrapup": [
            r"\bany questions\b",
            r"\bfeedback\b",
            r"\bnext steps\b",
            r"\bwrap up\b",
            r"\bthank(s| you)\b",
            r"\bgreat job\b",
        ],
    }


def get_single_pass_system_prompt() -> str:
    return """
You are an honest, fair, and consistent technical interview coach.

You are evaluating an ENTRY-LEVEL Software Engineering LeetCode-style interview.

You must evaluate:
1. Coding quality as demonstrated in the submitted code and interview discussion
2. Worst-case time complexity
3. Auxiliary space complexity
4. Communication skills
5. Problem-solving skills
6. Overall score
7. Pass/fail

Important rules:
- Be conservative and fair.
- Do not nitpick minor syntax issues.
- Do not over-penalize language-specific quirks.
- Do not invent missing behaviors.
- Use the transcript sections and code together.
- Reason from the code actually shown.
- Report worst-case complexity.
- For auxiliary space, exclude input storage unless explicitly required.
- Return VALID JSON ONLY.
- No markdown.
- No extra text.
""".strip()


@dataclass
class Turn:
    speaker: str
    text: str


def parse_turns(transcript: str) -> List[Turn]:
    if transcript is None:
        return []

    text = str(transcript).replace("\\n", "\n").strip()
    if not text:
        return []

    speaker_inline_re = get_speaker_inline_re()
    matches = list(speaker_inline_re.finditer(text))
    if not matches:
        return [Turn(speaker="UNKNOWN", text=text)]

    turns: List[Turn] = []
    for i, match in enumerate(matches):
        speaker = match.group(1).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        if body:
            turns.append(Turn(speaker=speaker, text=body))
    return turns


def code_hint_score(text: str) -> float:
    code_hint_re = get_code_hint_re()
    symbols = len(re.findall(r"[{};\[\]=<>]|->|==|!=|<=|>=|=>", text))
    keywords = len(code_hint_re.findall(text))
    indentation = sum(1 for line in text.splitlines() if line.startswith(("  ", "\t")))
    return keywords + 0.8 * symbols + 0.5 * indentation


def infer_roles(turns: List[Turn]) -> Dict[str, str]:
    if not turns:
        return {}

    speakers = sorted({t.speaker for t in turns})
    stats: Dict[str, Dict[str, float]] = {
        s: {"words": 0, "code": 0, "turns": 0, "qs": 0} for s in speakers
    }

    for turn in turns:
        stats[turn.speaker]["turns"] += 1
        stats[turn.speaker]["words"] += len(turn.text.split())
        stats[turn.speaker]["code"] += code_hint_score(turn.text)
        stats[turn.speaker]["qs"] += turn.text.count("?")

    candidate = max(
        speakers,
        key=lambda s: (stats[s]["code"], stats[s]["words"], stats[s]["turns"]),
    )

    roles = {candidate: "candidate"}

    if len(speakers) >= 2:
        remaining = [s for s in speakers if s != candidate]
        interviewer = max(
            remaining,
            key=lambda s: (stats[s]["qs"], stats[s]["turns"], stats[s]["words"]),
        )
        roles[interviewer] = "interviewer"

    for speaker in speakers:
        roles.setdefault(speaker, "other")

    return roles


def classify_turn(text: str) -> str:
    tx = text.lower()
    scores: Dict[str, float] = {}
    phase_patterns = get_phase_patterns()

    def add_score(phase: str, amount: float) -> None:
        scores[phase] = scores.get(phase, 0.0) + amount

    q_count = text.count("?")
    if q_count:
        add_score("clarifying", 0.7 * q_count)
        add_score("testing", 0.2 * q_count)

    for phase, patterns in phase_patterns.items():
        for pattern in patterns:
            hits = len(re.findall(pattern, tx))
            if hits:
                add_score(phase, float(hits))

    cscore = code_hint_score(text)
    if cscore >= 3:
        add_score("coding", 2.5)
        if "clarifying" in scores:
            scores["clarifying"] *= 0.3

    if "o(" in tx:
        add_score("complexity", 3.0)

    if not scores:
        return "other"

    best_phase, best_value = max(scores.items(), key=lambda item: item[1])
    return best_phase if best_value >= 1.0 else "other"


def smooth_labels(labels: List[str], window: int = 2) -> List[str]:
    if not labels:
        return []

    smoothed: List[str] = []
    for idx in range(len(labels)):
        lo = max(0, idx - window)
        hi = min(len(labels), idx + window + 1)
        window_vals = labels[lo:hi]
        best = max(set(window_vals), key=window_vals.count)
        smoothed.append(best)
    return smoothed


def format_turn(turn: Turn) -> str:
    return f"{turn.speaker}: {turn.text}"


def assign_section(phase: str) -> int:
    if phase in {"warmup", "problem_recap", "clarifying"}:
        return 1
    if phase == "approach":
        return 2
    if phase == "coding":
        return 3
    if phase == "complexity":
        return 4
    if phase in {"testing", "debug"}:
        return 5
    return 0


def bundle_sections(transcript: str) -> Dict[str, str]:
    turns = parse_turns(transcript)
    if not turns:
        return {f"section_{i}": "" for i in range(1, 6)}

    roles = infer_roles(turns)
    labels = smooth_labels([classify_turn(t.text) for t in turns], window=2)

    sections = {i: [] for i in range(1, 6)}
    unresolved: List[Tuple[Turn, int]] = []

    for turn, phase in zip(turns, labels):
        sec = assign_section(phase)
        if sec == 0:
            unresolved.append((turn, 0))
        else:
            sections[sec].append(format_turn(turn))

    for turn, _ in unresolved:
        role = roles.get(turn.speaker, "other")
        text_lower = turn.text.lower()

        if role == "candidate":
            if code_hint_score(turn.text) >= 3:
                sections[3].append(format_turn(turn))
            elif any(token in text_lower for token in ["test", "example", "dry run", "walk through"]):
                sections[5].append(format_turn(turn))
            elif any(token in text_lower for token in ["o(", "time complexity", "space complexity", "linear", "constant"]):
                sections[4].append(format_turn(turn))
            elif any(token in text_lower for token in ["idea", "approach", "use", "plan", "strategy"]):
                sections[2].append(format_turn(turn))
            else:
                sections[1].append(format_turn(turn))
        else:
            if "?" in turn.text and len(turn.text.split()) <= 30:
                sections[1].append(format_turn(turn))
            else:
                sections[2].append(format_turn(turn))

    return {f"section_{i}": "\n".join(sections[i]).strip() for i in range(1, 6)}


def add_line_numbers(code: str) -> str:
    lines = str(code).splitlines()
    if not lines:
        return "1: "
    width = len(str(len(lines)))
    return "\n".join(f"{str(i+1).rjust(width)}: {line}" for i, line in enumerate(lines))


def build_single_pass_user_prompt(
    problem_statement: str,
    constraints: str,
    language: str,
    code: str,
    transcript_sections: Dict[str, str],
) -> str:
    line_numbered_code = add_line_numbers(code)

    return f"""
Evaluate this ENTRY-LEVEL LeetCode-style interview in ONE PASS.

You must evaluate both the code and the interview communication using the rubric below.

[PROBLEM]
{problem_statement}

[CONSTRAINTS]
{constraints}

[LANGUAGE]
{language}

[FINAL CODE WITH LINE NUMBERS]
{line_numbered_code}

[SECTION 1]
{transcript_sections.get("section_1", "")}

[SECTION 2]
{transcript_sections.get("section_2", "")}

[SECTION 3]
{transcript_sections.get("section_3", "")}

[SECTION 4]
{transcript_sections.get("section_4", "")}

[SECTION 5]
{transcript_sections.get("section_5", "")}
""".strip()


def _require_keys(obj: JsonDict, keys: List[str]) -> None:
    missing = [k for k in keys if k not in obj]
    if missing:
        raise ValueError(f"Missing required keys: {missing}")


def _ensure_score(name: str, value: Any) -> None:
    if not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be numeric.")
    if value < 1 or value > 4:
        raise ValueError(f"{name} must be between 1 and 4. Got: {value}")


def _ensure_str(name: str, value: Any, max_len: Optional[int] = None) -> None:
    if not isinstance(value, str):
        raise ValueError(f"{name} must be a string.")
    if max_len is not None and len(value) > max_len:
        raise ValueError(f"{name} exceeds max length {max_len}. Got {len(value)} chars.")


def _ensure_list_of_str(name: str, value: Any) -> None:
    if not isinstance(value, list) or not all(isinstance(x, str) for x in value):
        raise ValueError(f"{name} must be a list of strings.")


def validate_single_pass_result(result: JsonDict) -> None:
    required = [
        "coding_score",
        "coding_reason",
        "time",
        "space_aux",
        "parameters",
        "complexity_justification",
        "complexity_assumptions",
        "Communication",
        "Communication_reason",
        "Ps",
        "Ps_reason",
        "Overall",
        "Pass",
        "Feedback",
    ]
    _require_keys(result, required)

    _ensure_score("coding_score", result["coding_score"])
    _ensure_score("Communication", result["Communication"])
    _ensure_score("Ps", result["Ps"])
    _ensure_score("Overall", result["Overall"])

    _ensure_str("coding_reason", result["coding_reason"], 150)
    _ensure_str("time", result["time"], 50)
    _ensure_str("space_aux", result["space_aux"], 50)
    _ensure_list_of_str("parameters", result["parameters"])
    _ensure_str("complexity_justification", result["complexity_justification"], 300)
    _ensure_list_of_str("complexity_assumptions", result["complexity_assumptions"])
    _ensure_str("Communication_reason", result["Communication_reason"], 150)
    _ensure_str("Ps_reason", result["Ps_reason"], 150)
    _ensure_str("Feedback", result["Feedback"], 270)

    if not isinstance(result["Pass"], bool):
        raise ValueError("Pass must be a boolean.")

    comm = result["Communication"]
    ps = result["Ps"]
    coding = result["coding_score"]
    overall = result["Overall"]

    expected_pass = overall >= 3 and comm >= 3 and ps >= 3 and coding >= 3
    if result["Pass"] != expected_pass:
        raise ValueError(
            f"Pass flag violates rubric rules. Expected {expected_pass}, got {result['Pass']}."
        )

    feedback = result["Feedback"]
    if "You did really well at " not in feedback:
        raise ValueError("Feedback must start with 'You did really well at ...'")
    if "There’s room to improve your " not in feedback and "There's room to improve your " not in feedback:
        raise ValueError("Feedback must contain the required improvement sentence.")


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
    """
    Call this at request time.
    Do not create OpenAILLM or evaluator globally.
    """
    llm = OpenAILLM(model=model)
    evaluator = SinglePassInterviewEvaluator(llm)
    return evaluator.evaluate(
        transcript=transcript,
        code=code,
        problem_statement=problem_statement,
        constraints=constraints,
        language=language,
    )
