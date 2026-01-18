FROM python:3.11-slim

WORKDIR /app

# Copy source code
COPY . /app/

# Install dependencies
RUN pip install --no-cache-dir -e .

# Expose port for SSE
EXPOSE 3000

# Run the MCP server
CMD ["python", "-m", "cloudflare_mcp_server"]
