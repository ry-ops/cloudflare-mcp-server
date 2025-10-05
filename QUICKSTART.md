# Cloudflare MCP Server - Quick Start Guide (Python + uv)

Get up and running with the Cloudflare MCP Server in 5 minutes using Python and uv!

## Step 1: Install uv (if you haven't already)

```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with pip
pip install uv
```

## Step 2: Get Your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Choose **"Edit zone DNS"** template (or create custom)
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** (you won't see it again!)

## Step 3: Find Your Account ID (Optional, for KV)

1. Go to https://dash.cloudflare.com/
2. Click on any website/domain
3. Scroll down on the Overview page
4. Copy your **Account ID** from the right sidebar

## Step 4: Install the Server

```bash
cd cloudflare-mcp-server

# Install with uv (recommended - super fast!)
uv pip install -e .

# Or install with regular pip
pip install -e .
```

## Step 5: Configure Claude Desktop

### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

### Configuration with uv (recommended):

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "uv",
      "args": [
        "--directory",
        "/absolute/path/to/cloudflare-mcp-server",
        "run",
        "cloudflare-mcp-server"
      ],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_token_here",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here"
      }
    }
  }
}
```

### Alternative - Using Python directly:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "python",
      "args": [
        "-m",
        "cloudflare_mcp_server"
      ],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_token_here",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/cloudflare-mcp-server` with the actual full path!

### Finding the absolute path:

**macOS/Linux:**
```bash
cd cloudflare-mcp-server
pwd
```

**Windows (PowerShell):**
```powershell
cd cloudflare-mcp-server
(Get-Location).Path
```

## Step 6: Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

## Step 7: Test It!

Open Claude and try:

> "List my Cloudflare zones"

or

> "Show me all DNS records for example.com"

## Testing Locally (Optional)

You can test the server locally before adding it to Claude:

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"

# Run the server
uv run cloudflare-mcp-server
```

## Common First Tasks

### View Your Zones
> "What zones do I have in my Cloudflare account?"

### List DNS Records
> "Show me all A records for example.com"

### Create a DNS Record
> "Create an A record for api.example.com pointing to 192.0.2.1"

### Purge Cache
> "Clear the cache for example.com"

### Workers KV
> "List my KV namespaces"

## Troubleshooting

### "uv: command not found"
- Install uv using the command in Step 1
- Or use the Python direct method instead

### "No module named 'cloudflare_mcp_server'"
- Make sure you ran `uv pip install -e .` in the project directory
- Check that you're using the correct Python environment

### "Server not found" or tools don't appear
- Make sure the path in config is absolute
- For uv: verify `--directory` path is correct
- Restart Claude Desktop completely
- Check the path exists

### "CLOUDFLARE_API_TOKEN environment variable is required"
- Check your token is correctly pasted in the config file
- Make sure there are no extra spaces or quotes
- The token should look like: `eyJhb...`

### "Cloudflare API error: Invalid token"
- Verify the token hasn't expired
- Check the token has necessary permissions
- Try creating a new token

### "Account ID is required"
- Add `CLOUDFLARE_ACCOUNT_ID` to your config
- This is only needed for KV operations

## Why Use uv?

- ⚡ **10-100x faster** than pip at installing packages
- 🔒 **Better dependency resolution** - no more conflicts
- 🎯 **Simpler workflow** - one tool for everything
- 🐍 **Drop-in replacement** for pip

## Development Tips

```bash
# Install with dev dependencies
uv pip install -e ".[dev]"

# Format code
uv run ruff format src/

# Lint code
uv run ruff check src/

# Run tests (when implemented)
uv run pytest
```

## Security Reminder

🔒 **Never share or commit your API token!** It has full access to your Cloudflare account.

## Next Steps

Once everything works, explore:
- Setting up DNS records
- Managing your Workers KV data
- Purging cache strategically
- Viewing analytics

Check out [EXAMPLES.md](EXAMPLES.md) for 25+ practical examples!

Happy automating! 🚀
