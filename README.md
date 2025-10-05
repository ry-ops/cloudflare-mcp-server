<img src="https://github.com/ry-ops/cloudflare-mcp-server/blob/main/cloudflare-mcp-server.png" width="100%">

# Cloudflare MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with the Cloudflare API. This server enables AI assistants to manage Cloudflare resources including zones, DNS records, Workers KV storage, cache purging, and analytics.

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
- Node.js 18 or higher
- A Cloudflare account with an API token

### Quick Start

1. **Clone or create the project:**
```bash
mkdir cloudflare-mcp-server
cd cloudflare-mcp-server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the server:**
```bash
npm run build
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

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cloudflare": {
      "command": "node",
      "args": ["/absolute/path/to/cloudflare-mcp-server/dist/index.js"],
      "env": {
        "CLOUDFLARE_API_TOKEN": "your_api_token_here",
        "CLOUDFLARE_ACCOUNT_ID": "your_account_id_here"
      }
    }
  }
}
```

## Available Tools

### Zone Operations

#### `list_zones`
List all zones in your Cloudflare account.

**Parameters:**
- `name` (optional): Filter zones by name
- `status` (optional): Filter by status (active, pending, initializing, moved, deleted, deactivated)
- `page` (optional): Page number for pagination
- `per_page` (optional): Results per page (max 50)

**Example:**
```json
{
  "name": "example.com",
  "status": "active",
  "per_page": 20
}
```

#### `get_zone`
Get detailed information about a specific zone.

**Parameters:**
- `zone_id` (required): The zone identifier

### DNS Operations

#### `list_dns_records`
List DNS records for a zone with optional filtering.

**Parameters:**
- `zone_id` (required): The zone identifier
- `type` (optional): Record type (A, AAAA, CNAME, TXT, MX, etc.)
- `name` (optional): Filter by record name
- `content` (optional): Filter by record content
- `page` (optional): Page number
- `per_page` (optional): Results per page (max 100)

#### `create_dns_record`
Create a new DNS record.

**Parameters:**
- `zone_id` (required): The zone identifier
- `type` (required): Record type
- `name` (required): Record name (e.g., "www" or "@")
- `content` (required): Record content (IP address, hostname, etc.)
- `ttl` (optional): Time to live (1 = automatic, or 120-86400 seconds)
- `proxied` (optional): Proxy through Cloudflare (A, AAAA, CNAME only)
- `priority` (optional): Priority (MX, SRV records)
- `comment` (optional): Comment for the record

**Example:**
```json
{
  "zone_id": "abc123...",
  "type": "A",
  "name": "www",
  "content": "192.0.2.1",
  "proxied": true,
  "ttl": 1
}
```

#### `update_dns_record`
Update an existing DNS record.

**Parameters:**
- `zone_id` (required): The zone identifier
- `record_id` (required): The DNS record ID to update
- `type` (required): Record type
- `name` (required): Record name
- `content` (required): Record content
- `ttl` (optional): Time to live
- `proxied` (optional): Proxy status
- `priority` (optional): Priority
- `comment` (optional): Comment

#### `delete_dns_record`
Delete a DNS record.

**Parameters:**
- `zone_id` (required): The zone identifier
- `record_id` (required): The DNS record ID to delete

### Cache Operations

#### `purge_cache`
Purge Cloudflare's cache for a zone.

**Parameters:**
- `zone_id` (required): The zone identifier
- `purge_everything` (optional): Purge all cached content
- `files` (optional): Array of URLs to purge
- `tags` (optional): Array of cache tags to purge
- `hosts` (optional): Array of hosts to purge

**Example (purge specific files):**
```json
{
  "zone_id": "abc123...",
  "files": [
    "https://example.com/style.css",
    "https://example.com/script.js"
  ]
}
```

**Example (purge everything - use cautiously!):**
```json
{
  "zone_id": "abc123...",
  "purge_everything": true
}
```

### Workers KV Operations

#### `list_kv_namespaces`
List all Workers KV namespaces in your account.

**Parameters:**
- `account_id` (optional): Account ID (uses config default if not provided)
- `page` (optional): Page number
- `per_page` (optional): Results per page

#### `read_kv_value`
Read a value from KV storage.

**Parameters:**
- `account_id` (optional): Account ID
- `namespace_id` (required): KV namespace ID
- `key` (required): The key to read

#### `write_kv_value`
Write a key-value pair to KV storage.

**Parameters:**
- `account_id` (optional): Account ID
- `namespace_id` (required): KV namespace ID
- `key` (required): The key to write
- `value` (required): The value to store
- `expiration_ttl` (optional): Seconds until expiration
- `metadata` (optional): JSON metadata object

**Example:**
```json
{
  "namespace_id": "abc123...",
  "key": "config:production",
  "value": "{\"api_url\": \"https://api.example.com\"}",
  "expiration_ttl": 3600,
  "metadata": {"environment": "production"}
}
```

#### `delete_kv_value`
Delete a key from KV storage.

**Parameters:**
- `account_id` (optional): Account ID
- `namespace_id` (required): KV namespace ID
- `key` (required): The key to delete

#### `list_kv_keys`
List all keys in a KV namespace.

**Parameters:**
- `account_id` (optional): Account ID
- `namespace_id` (required): KV namespace ID
- `prefix` (optional): Filter keys by prefix
- `limit` (optional): Max keys to return (default 1000)
- `cursor` (optional): Cursor for pagination

### Analytics

#### `get_zone_analytics`
Get analytics data for a zone.

**Parameters:**
- `zone_id` (required): The zone identifier
- `since` (optional): Start time (ISO 8601 or relative like "-1440" for last 24h)
- `until` (optional): End time (ISO 8601 or relative like "-0")

**Example:**
```json
{
  "zone_id": "abc123...",
  "since": "-1440",
  "until": "-0"
}
```

## Usage Examples

### Example 1: Managing DNS Records

**Ask Claude:**
> "List all DNS records for my domain example.com"

Claude will use `list_zones` to find your zone ID, then `list_dns_records` to show all records.

### Example 2: Creating a New Record

**Ask Claude:**
> "Create a new A record for api.example.com pointing to 192.0.2.100 with Cloudflare proxy enabled"

Claude will use `create_dns_record` with the appropriate parameters.

### Example 3: Cache Management

**Ask Claude:**
> "Purge the cache for https://example.com/style.css and https://example.com/script.js"

Claude will use `purge_cache` to selectively clear those specific files.

### Example 4: Workers KV Storage

**Ask Claude:**
> "Store a configuration value in KV with the key 'api-config' and value containing my API endpoint"

Claude will use `write_kv_value` to store your configuration.

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Watch Mode

```bash
npm run watch
```

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
   - Make sure you've set the `CLOUDFLARE_API_TOKEN` environment variable
   - Check your Claude Desktop config file has the correct token

2. **"Account ID is required"**
   - Set `CLOUDFLARE_ACCOUNT_ID` environment variable for KV operations
   - Or pass `account_id` parameter directly in tool calls

3. **"Cloudflare API error: Invalid token"**
   - Verify your API token is correct
   - Check that the token hasn't expired
   - Ensure the token has the necessary permissions

4. **DNS record creation fails**
   - Verify the zone exists and is active
   - Check that the record type and content are valid
   - For CNAME records, ensure no other record types exist at that name

## Security Notes

- **Never commit your API token to version control**
- Store tokens securely using environment variables
- Use API tokens instead of API keys (they're more secure and can be scoped)
- Regularly rotate your API tokens
- Use the minimum required permissions for your token

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT

## Links

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/download)

## Support

For issues related to:
- **This MCP server**: Open an issue on GitHub
- **Cloudflare API**: Check [Cloudflare Developer Docs](https://developers.cloudflare.com/)
- **MCP Protocol**: Check [MCP Documentation](https://modelcontextprotocol.io/)
