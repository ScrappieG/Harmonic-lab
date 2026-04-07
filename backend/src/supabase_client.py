from fastapi import HTTPException


class SupabaseClient:
    def __init__(self, url: str, key: str):
        import httpx
        self._httpx = httpx
        self.url = url.rstrip("/")
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def _rest_url(self, table: str) -> str:
        return f"{self.url}/rest/v1/{table}"

    async def select(self, table: str, query: str = "*", filters: dict | None = None) -> list:
        """SELECT rows from a table. filters = {"column": "eq.value", ...}"""
        params = {"select": query}
        if filters:
            params.update(filters)
        async with self._httpx.AsyncClient() as client:
            response = await client.get(
                self._rest_url(table),
                headers={**self.headers, "Prefer": "return=representation"},
                params=params,
            )
        response.raise_for_status()
        return response.json()

    async def insert(self, table: str, data: dict | list) -> list:
        """INSERT one or more rows. Returns inserted rows."""
        async with self._httpx.AsyncClient() as client:
            response = await client.post(
                self._rest_url(table),
                headers={**self.headers, "Prefer": "return=representation"},
                json=data,
            )
        response.raise_for_status()
        return response.json()

    async def update(self, table: str, data: dict, filters: dict) -> list:
        """UPDATE rows matching filters. filters = {"column": "eq.value", ...}"""
        async with self._httpx.AsyncClient() as client:
            response = await client.patch(
                self._rest_url(table),
                headers={**self.headers, "Prefer": "return=representation"},
                params=filters,
                json=data,
            )
        response.raise_for_status()
        return response.json()

    async def auth_get_user(self, access_token: str) -> dict:
        """Validate a JWT and return the user. Raises HTTPException if invalid."""
        async with self._httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.url}/auth/v1/user",
                headers={**self.headers, "Authorization": f"Bearer {access_token}"},
            )
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        response.raise_for_status()
        return response.json()

    async def upsert(self, table: str, data: dict | list, on_conflict: str) -> list:
        """UPSERT rows, merging on the given conflict column(s)."""
        async with self._httpx.AsyncClient() as client:
            response = await client.post(
                self._rest_url(table),
                headers={**self.headers, "Prefer": "return=representation,resolution=merge-duplicates"},
                params={"on_conflict": on_conflict},
                json=data,
            )
        response.raise_for_status()
        return response.json()

    async def delete(self, table: str, filters: dict) -> list:
        """DELETE rows matching filters. filters = {"column": "eq.value", ...}"""
        async with self._httpx.AsyncClient() as client:
            response = await client.delete(
                self._rest_url(table),
                headers={**self.headers, "Prefer": "return=representation"},
                params=filters,
            )
        response.raise_for_status()
        return response.json()


def get_supabase(request) -> SupabaseClient:
    """Get a SupabaseClient from the Cloudflare Worker env attached to the request."""
    env = request.scope["env"]
    url = getattr(env, "SUPABASE_PUB_URL", None)
    key = getattr(env, "SUPABASE_PUB_KEY", None)
    if not url or not key:
        raise HTTPException(status_code=500, detail="SUPABASE_URL or SUPABASE_KEY missing")
    return SupabaseClient(url, key)
