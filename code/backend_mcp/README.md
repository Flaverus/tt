# Backend MCP service

This service exposes the `/weather/latest` endpoint which internally spins up an
MCP-use agent. The agent launches MongoDB's official MCP server
[as documented by MongoDB](https://www.mongodb.com/docs/mcp-server/get-started/?client=claude-desktop&deployment-type=atlas),
invokes the configured MongoDB MCP tool, and returns the most recent weather
document stored in Atlas.

## Running locally

1. Install dependencies: `pip install -r requirements.txt`
2. Start the MongoDB MCP server via Docker. A ready-to-use service is defined in `code/database/compose.yml`, so you can run `docker compose -f ../database/compose.yml up -d mongodb mongodb-mcp` from this directory. This uses the official [`mongodb/mongodb-mcp-server`](https://github.com/mongodb-js/mongodb-mcp-server) image and exposes it over HTTP on port `3000`.
3. Configure your LLM provider. The service talks to Groq's hosted Qwen models, so export `GROQ_API_KEY` (or place it in `.env`) before starting FastAPI.
4. Define the MongoDB, MCP and LLM connection settings (for example in a `.env` file):

   ```ini
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DATABASE=weather
   MONGODB_COLLECTION=measurements
   MONGODB_SORT_FIELD=timestamp
   ```

   ```ini
   # Option A: connect to the dockerised MongoDB MCP server over HTTP
   MONGO_MCP_HTTP_URL=http://localhost:3000/mcp
   MONGO_MCP_HTTP_HEADERS={}

   # Option B: let the backend launch the MCP server via stdio/docker
   MONGO_MCP_COMMAND=docker
   MONGO_MCP_ARGS='run --rm -i mongodb/mongodb-mcp-server:latest'
   MCP_TOOL_NAME=mongodb.collection.findOne
   MCP_TOOL_ARGUMENTS={"database":"weather","collection":"measurements","sort":{"timestamp":-1}}
   MCP_DISALLOWED_TOOLS=list-collections,list-databases,collection-indexes,collection-schema,collection-storage-size,count,db-stats,aggregate,explain,mongodb-logs,export,switch-connection,config,debug_mongodb
   ```

   ```ini
   GROQ_MODEL=qwen/qwen3-32b
   GROQ_TEMPERATURE=0.6
   GROQ_MAX_TOKENS=1024
   GROQ_MAX_RETRIES=1
   GROQ_API_KEY=<set-me>
   AGENT_INSTRUCTIONS=Always call the MongoDB MCP tool before responding and output strict JSON.
   ```

5. Start FastAPI: `uvicorn app.main:app --reload`

The `/weather/latest` route returns a JSON payload similar to:

```json
{
  "latest": {
    "id": "...",
    "temperature": 21.5,
    "humidity": 42,
    "timestamp": "2025-03-01T10:15:00Z"
  },
  "history": ["..."],
  "count": 1,
  "summary": "Latest weather sample shows 21.5°C and 42% humidity",
  "source": "mongodb-mcp"
}
```

### Docker Compose

`code/backend_mcp/docker-compose.yml` builds and runs the FastAPI backend. Provide your Groq API key inline:

```bash
cd code/backend_mcp
GROQ_API_KEY=sk-... docker compose up --build
```

The compose file loads the local `.env`, exposes port `8000`, and forwards `MONGO_MCP_HTTP_URL` (defaulting to `http://host.docker.internal:3000/mcp`) so the container can reach the MCP server running on your host.

### Environment overrides

- `MONGO_MCP_COMMAND`: Binary used to start the MongoDB MCP server (default `npx`).
- `MONGO_MCP_ARGS`: Arguments for the MongoDB MCP server command (space-separated string).
- `MCP_TOOL_NAME`: Name of the MongoDB MCP tool to invoke.
- `MCP_TOOL_ARGUMENTS`: JSON payload passed as the tool arguments (database, collection, pipeline, etc.).
- `MCP_DISALLOWED_TOOLS`: Optional comma-separated list of MongoDB MCP tools to hide from the agent so it only sees what it must use.
- `GROQ_MODEL`, `GROQ_TEMPERATURE`, `GROQ_MAX_TOKENS`, `GROQ_MAX_RETRIES`, `GROQ_API_KEY`: Configure the Groq-hosted model that powers the MCP agent. Tune `GROQ_MAX_TOKENS` to stay under your service-tier limits.
- `AGENT_INSTRUCTIONS`: Default prompt telling the LLM to output JSON with `latest`, `history`, `count`, `summary`, and `recommendation` so the response always includes guidance text.
- `MCP_AGENT_MAX_STEPS`: Guardrails for the MCP agent loop (default `3`). Keep this at `2` or higher so LangChain's recursion limit does not abort the run.
