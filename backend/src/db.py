from supabase_client import SupabaseClient


async def create_session(db: SupabaseClient, user_id: str, problem_name: str, problem_url: str) -> dict:
    rows = await db.insert("sessions", {
        "user_id": user_id,
        "problem_name": problem_name,
        "problem_url": problem_url,
    })
    return rows[0]


async def finish_session(db: SupabaseClient, session_id: str, total_time: int) -> dict:
    rows = await db.update("sessions", {"total_time": total_time}, {"id": f"eq.{session_id}"})
    return rows[0]


async def save_problem_details(
    db: SupabaseClient,
    session_id: str,
    transcript: str,
    code: str,
    problem_statement: str,
) -> dict:
    rows = await db.insert("problem_details", {
        "session_id": session_id,
        "transcript": transcript,
        "code": code,
        "problem_statement": problem_statement,
    })
    return rows[0]


async def save_score(db: SupabaseClient, session_id: str, score_data: dict) -> dict:
    rows = await db.insert("score", {"session_id": session_id, **score_data})
    return rows[0]


async def get_user_sessions(db: SupabaseClient, user_id: str) -> list:
    return await db.select(
        "sessions",
        query="*",
        filters={"user_id": f"eq.{user_id}", "order": "created_at.desc"},
    )


async def get_session_result(db: SupabaseClient, session_id: str, user_id: str) -> dict:
    from fastapi import HTTPException
    sessions = await db.select("sessions", filters={"id": f"eq.{session_id}"})
    if not sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    if sessions[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    scores = await db.select("score", filters={"session_id": f"eq.{session_id}"})
    details = await db.select("problem_details", filters={"session_id": f"eq.{session_id}"})
    return {
        "session": sessions[0],
        "score": scores[0] if scores else None,
        "problem_details": details[0] if details else None,
    }


async def insert_user(db: SupabaseClient, user_id: str, email: str) -> dict:
    rows = await db.upsert(
        "User",
        {"id": user_id, "email": email},
        on_conflict="id",
    )
    return rows[0]
