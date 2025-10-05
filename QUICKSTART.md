# Cloudflare MCP Server - Quick Start Guide

Get up and running with the Cloudflare MCP Server in 5 minutes!

## Step 1: Get Your Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Choose **"Edit zone DNS"** template (or create custom)
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** (you won't see it again!)

## Step 2: Find Your Account ID (Optional, for KV)

1. Go to https://dash.cloudflare.com/
2. Click on any website/domain
3. Scroll down on the Overview page
4. Copy your **Account ID** from the right sidebar

## Step 3: Install the Server

```bash
cd cloudflare-mcp-server
npm install
npm run build
```

## Step 4: Configure Claude Desktop

### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/absolute/path/to/cloudflare-mcp-server/dist/index.js"],
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

## Step 5: Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

## Step 6: Test It!

Open Claude and try:

> "List my Cloudflare zones"

or

> "Show me all DNS records for example.com"

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

### "Server not found" or tools don't appear
- Make sure the path in config is absolute (starts with `/` on macOS/Linux or `C:\` on Windows)
- Restart Claude Desktop completely
- Check the path exists: `ls /path/to/cloudflare-mcp-server/dist/index.js`

### "CLOUDFLARE_API_TOKEN environment variable is required"
- Check your token is correctly pasted in the config file
- Make sure there are no extra spaces or quotes
- The token should start with something like: `eyJhb...`

### "Cloudflare API error: Invalid token"
- Verify the token hasn't expired
- Check the token has necessary permissions
- Try creating a new token

### "Account ID is required"
- Add `CLOUDFLARE_ACCOUNT_ID` to your config
- Or pass it as a parameter: `account_id: "your_account_id"`

## Getting Help

- Check the full README.md for detailed documentation
- Review Cloudflare API docs: https://developers.cloudflare.com/api/
- Check MCP docs: https://modelcontextprotocol.io/

## Security Reminder

🔒 **Never share or commit your API token!** It has full access to your Cloudflare account.

## Next Steps

Once everything works, explore:
- Setting up DNS records
- Managing your Workers KV data
- Purging cache strategically
- Viewing analytics

Happy automating! 🚀
