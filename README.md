<img src="https://github.com/ry-ops/cloudflare-mcp-server/blob/main/cloudflare-mcp-server.png" width="100%">

# Cloudflare MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with the Cloudflare API. Built with Python and managed with `uv` for blazing-fast dependency management.

## Features

### 🌐 Zone Management
- List all zones in your account
- Get detailed zone information
- Filter zones by name and status

### 🔧 DNS Management
- List DNS records with filtering
- Create new DNS records (A, AAAA, CNAME, TXT, MX, etc.)
- Update existing records
- Delete records
- Full support for proxied records and TTL configuration

### 💾 Workers KV Storage
- List KV namespaces
- Read values from KV
- Write key-value pairs with optional TTL
- Delete keys
- List keys with prefix filtering
- Support for metadata

### ⚡ Cache & Performance
- Purge cache (entire zone or specific files/tags/hosts)
- Get zone analytics (requests, bandwidth, threats)

## Installation

### Prerequisites
- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) installed
- A Cloudflare account with an API token

### Quick Start with uv

1. **Clone or create the project:**
```bash
mkdir cloudflare-mcp-server
cd cloudflare-mcp-server
```

2. **Install with uv:**
```bash
uv pip install -e .
```

Or install from the directory:
```bash
uv pip install cloudflare-mcp-server
```

### Alternative: Using pip

```bash
pip install -e .
```

## Configuration

### Getting Your Cloudflare Credentials

1. **API Token** (Required):
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Edit zone DNS" template or create a custom token with the permissions you need
   - Copy the token

2. **Account ID** (Optional, but required for KV operations):
   - Go to your Cloudflare dashboard
   - Select any website
   - Scroll down on the Overview page to find your Account ID

### Environment Variables

Set the following environment variables:

```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"  # Optional, needed for KV
```

Or create a `.env` file (see `.env.example`).

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

#### Using uv (recommended):

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
        "CLOUDFLARE_API_TOKEN": "your_api_token_here",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here"
      }
    }
  }
}
```

#### Using Python directly:

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "python",
      "args": ["-m", "cloudflare_mcp_server"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_api_token_here",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here"
      }
    }
  }
}
```

## Available Tools

The server provides 13 powerful tools for managing Cloudflare resources:

### Zone Operations
- `list_zones` - List all zones (domains) with optional filtering
- `get_zone` - Get detailed information about a specific zone

### DNS Operations
- `list_dns_records` - List DNS records with filtering
- `create_dns_record` - Create new DNS records
- `update_dns_record` - Update existing DNS records
- `delete_dns_record` - Delete DNS records

### Cache Operations
- `purge_cache` - Purge cached content (entire zone or specific files/tags/hosts)

### Workers KV Operations
- `list_kv_namespaces` - List all KV namespaces
- `read_kv_value` - Read a value from KV storage
- `write_kv_value` - Write a key-value pair to KV
- `delete_kv_value` - Delete a key from KV
- `list_kv_keys` - List all keys in a namespace

### Analytics
- `get_zone_analytics` - Get analytics data for a zone

For detailed documentation on each tool, see [EXAMPLES.md](EXAMPLES.md).

## Development

### Using uv for Development

```bash
# Install in development mode with dev dependencies
uv pip install -e ".[dev]"

# Run the server directly
uv run cloudflare-mcp-server

# Run tests (when implemented)
uv run pytest

# Format code with ruff
uv run ruff format src/

# Lint code
uv run ruff check src/
```

### Project Structure

```
cloudflare-mcp-server/
├── src/
│   └── cloudflare_mcp_server/
│       └── __init__.py       # Main server implementation
├── tests/                     # Tests (to be implemented)
├── pyproject.toml            # Project configuration (uv-compatible)
├── README.md                 # This file
├── QUICKSTART.md            # Quick start guide
├── EXAMPLES.md              # Usage examples
└── .env.example             # Environment template
```

## Usage Examples

### Example 1: List Your Zones

**Ask Claude:**
> "Show me all my Cloudflare zones"

### Example 2: Create a DNS Record

**Ask Claude:**
> "Create an A record for api.example.com pointing to 192.0.2.100 with proxy enabled"

### Example 3: Purge Cache

**Ask Claude:**
> "Clear the cache for https://example.com/style.css"

For more examples, see [EXAMPLES.md](EXAMPLES.md).

## API Permissions

Your Cloudflare API token needs appropriate permissions based on what operations you want to perform:

### Minimum Permissions:
- **Zone - Zone - Read** (for listing zones)
- **Zone - DNS - Edit** (for DNS operations)

### Additional Permissions for Advanced Features:
- **Account - Workers KV Storage - Edit** (for KV operations)
- **Zone - Cache Purge - Purge** (for cache operations)
- **Zone - Analytics - Read** (for analytics)

## Troubleshooting

### Common Issues

1. **"CLOUDFLARE_API_TOKEN environment variable is required"**
   - Make sure you've set the environment variable
   - Check your Claude Desktop config has the correct token in the `env` section

2. **"Account ID is required"**
   - Set `CLOUDFLARE_ACCOUNT_ID` environment variable for KV operations
   - Or pass `account_id` parameter directly in tool calls

3. **uv command not found**
   - Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
   - Or use pip as an alternative

4. **Module not found errors**
   - Make sure you installed the package: `uv pip install -e .`
   - Check you're in the right directory

## Why uv?

This project uses [uv](https://github.com/astral-sh/uv) because it's:
- ⚡ **10-100x faster** than pip
- 🔒 **More reliable** with better dependency resolution
- 🎯 **Simpler** - one tool for everything
- 🐍 **Modern** - built in Rust, designed for Python

## Security Notes

- **Never commit your API token to version control**
- Store tokens securely using environment variables
- Use API tokens instead of API keys (they're more secure and can be scoped)
- Regularly rotate your API tokens
- Use the minimum required permissions for your token

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [uv - Python Package Manager](https://github.com/astral-sh/uv)
- [Claude Desktop](https://claude.ai/download)

## Support

For issues related to:
- **This MCP server**: Open an issue on GitHub
- **Cloudflare API**: Check [Cloudflare Developer Docs](https://developers.cloudflare.com/)
- **MCP Protocol**: Check [MCP Documentation](https://modelcontextprotocol.io/)
- **uv**: Check [uv Documentation](https://github.com/astral-sh/uv)
