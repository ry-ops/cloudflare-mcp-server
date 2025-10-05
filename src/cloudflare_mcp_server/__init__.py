"""Cloudflare MCP Server - Python Implementation"""

import asyncio
import json
import os
from typing import Any, Optional

import httpx
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent


CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4"


class CloudflareMCPServer:
    """MCP Server for Cloudflare API integration."""

    def __init__(self, api_token: str, account_id: Optional[str] = None):
        self.api_token = api_token
        self.account_id = account_id
        self.server = Server("cloudflare-mcp-server")
        self.client = httpx.AsyncClient(timeout=30.0)
        self._setup_handlers()

    async def _make_request(
        self,
        endpoint: str,
        method: str = "GET",
        data: Optional[dict] = None,
        params: Optional[dict] = None,
    ) -> Any:
        """Make a request to the Cloudflare API."""
        url = f"{CLOUDFLARE_API_BASE}{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        try:
            response = await self.client.request(
                method=method,
                url=url,
                json=data,
                params=params,
                headers=headers,
            )
            response.raise_for_status()
            result = response.json()

            if not result.get("success"):
                errors = result.get("errors", [])
                raise Exception(f"Cloudflare API error: {json.dumps(errors)}")

            return result.get("result")

        except httpx.HTTPError as e:
            raise Exception(f"HTTP error occurred: {str(e)}")

    def _setup_handlers(self):
        """Set up MCP request handlers."""

        @self.server.list_tools()
        async def list_tools() -> list[Tool]:
            """List available tools."""
            return [
                Tool(
                    name="list_zones",
                    description=(
                        "List all zones (domains) in the Cloudflare account. "
                        "Returns zone details including ID, name, status, and nameservers."
                    ),
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Filter zones by name (optional)",
                            },
                            "status": {
                                "type": "string",
                                "description": "Filter by status: active, pending, initializing, moved, deleted, deactivated (optional)",
                            },
                            "page": {
                                "type": "number",
                                "description": "Page number for pagination (default: 1)",
                            },
                            "per_page": {
                                "type": "number",
                                "description": "Number of zones per page (default: 20, max: 50)",
                            },
                        },
                    },
                ),
                Tool(
                    name="get_zone",
                    description="Get detailed information about a specific zone by zone ID",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {
                                "type": "string",
                                "description": "The zone ID",
                            }
                        },
                        "required": ["zone_id"],
                    },
                ),
                Tool(
                    name="list_dns_records",
                    description="List DNS records for a zone. Can filter by type, name, content, etc.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {
                                "type": "string",
                                "description": "The zone ID",
                            },
                            "type": {
                                "type": "string",
                                "description": "DNS record type (A, AAAA, CNAME, TXT, MX, etc.)",
                            },
                            "name": {
                                "type": "string",
                                "description": "DNS record name to filter by",
                            },
                            "content": {
                                "type": "string",
                                "description": "DNS record content to filter by",
                            },
                            "page": {
                                "type": "number",
                                "description": "Page number for pagination",
                            },
                            "per_page": {
                                "type": "number",
                                "description": "Number of records per page (max: 100)",
                            },
                        },
                        "required": ["zone_id"],
                    },
                ),
                Tool(
                    name="create_dns_record",
                    description="Create a new DNS record in a zone. Supports all DNS record types.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {
                                "type": "string",
                                "description": "The zone ID",
                            },
                            "type": {
                                "type": "string",
                                "description": "DNS record type (A, AAAA, CNAME, TXT, MX, etc.)",
                            },
                            "name": {
                                "type": "string",
                                "description": "DNS record name (e.g., 'www' or '@' for root)",
                            },
                            "content": {
                                "type": "string",
                                "description": "DNS record content (e.g., IP address, hostname)",
                            },
                            "ttl": {
                                "type": "number",
                                "description": "Time to live (1 = automatic, or 120-86400 seconds)",
                                "default": 1,
                            },
                            "proxied": {
                                "type": "boolean",
                                "description": "Whether the record is proxied through Cloudflare (only for A, AAAA, CNAME)",
                                "default": False,
                            },
                            "priority": {
                                "type": "number",
                                "description": "Priority (for MX, SRV records)",
                            },
                            "comment": {
                                "type": "string",
                                "description": "Comment for the DNS record",
                            },
                        },
                        "required": ["zone_id", "type", "name", "content"],
                    },
                ),
                Tool(
                    name="update_dns_record",
                    description="Update an existing DNS record. Can modify type, name, content, TTL, proxy status, etc.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {"type": "string", "description": "The zone ID"},
                            "record_id": {
                                "type": "string",
                                "description": "The DNS record ID to update",
                            },
                            "type": {"type": "string", "description": "DNS record type"},
                            "name": {"type": "string", "description": "DNS record name"},
                            "content": {"type": "string", "description": "DNS record content"},
                            "ttl": {"type": "number", "description": "Time to live"},
                            "proxied": {
                                "type": "boolean",
                                "description": "Whether the record is proxied through Cloudflare",
                            },
                            "priority": {
                                "type": "number",
                                "description": "Priority (for MX, SRV records)",
                            },
                            "comment": {
                                "type": "string",
                                "description": "Comment for the DNS record",
                            },
                        },
                        "required": ["zone_id", "record_id", "type", "name", "content"],
                    },
                ),
                Tool(
                    name="delete_dns_record",
                    description="Delete a DNS record from a zone",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {"type": "string", "description": "The zone ID"},
                            "record_id": {
                                "type": "string",
                                "description": "The DNS record ID to delete",
                            },
                        },
                        "required": ["zone_id", "record_id"],
                    },
                ),
                Tool(
                    name="purge_cache",
                    description="Purge Cloudflare's cache for a zone. Can purge everything or specific files/tags/hosts.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {"type": "string", "description": "The zone ID"},
                            "purge_everything": {
                                "type": "boolean",
                                "description": "Purge all cached content (use cautiously!)",
                            },
                            "files": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Array of URLs to purge",
                            },
                            "tags": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Array of cache tags to purge",
                            },
                            "hosts": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Array of hosts to purge",
                            },
                        },
                        "required": ["zone_id"],
                    },
                ),
                Tool(
                    name="list_kv_namespaces",
                    description="List all Workers KV namespaces in the account. KV is Cloudflare's key-value storage.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "account_id": {
                                "type": "string",
                                "description": "Account ID (uses default from config if not provided)",
                            },
                            "page": {
                                "type": "number",
                                "description": "Page number for pagination",
                            },
                            "per_page": {
                                "type": "number",
                                "description": "Number of namespaces per page",
                            },
                        },
                    },
                ),
                Tool(
                    name="read_kv_value",
                    description="Read a value from Workers KV storage by key. Returns the stored value.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "account_id": {
                                "type": "string",
                                "description": "Account ID (uses default from config if not provided)",
                            },
                            "namespace_id": {
                                "type": "string",
                                "description": "The KV namespace ID",
                            },
                            "key": {"type": "string", "description": "The key to read"},
                        },
                        "required": ["namespace_id", "key"],
                    },
                ),
                Tool(
                    name="write_kv_value",
                    description="Write a key-value pair to Workers KV storage. Can store text or metadata.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "account_id": {
                                "type": "string",
                                "description": "Account ID (uses default from config if not provided)",
                            },
                            "namespace_id": {
                                "type": "string",
                                "description": "The KV namespace ID",
                            },
                            "key": {"type": "string", "description": "The key to write"},
                            "value": {"type": "string", "description": "The value to store"},
                            "expiration_ttl": {
                                "type": "number",
                                "description": "Number of seconds for the key to expire",
                            },
                            "metadata": {
                                "type": "object",
                                "description": "Arbitrary JSON metadata to store with the key",
                            },
                        },
                        "required": ["namespace_id", "key", "value"],
                    },
                ),
                Tool(
                    name="delete_kv_value",
                    description="Delete a key from Workers KV storage",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "account_id": {
                                "type": "string",
                                "description": "Account ID (uses default from config if not provided)",
                            },
                            "namespace_id": {
                                "type": "string",
                                "description": "The KV namespace ID",
                            },
                            "key": {"type": "string", "description": "The key to delete"},
                        },
                        "required": ["namespace_id", "key"],
                    },
                ),
                Tool(
                    name="list_kv_keys",
                    description="List all keys in a Workers KV namespace. Supports pagination and prefix filtering.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "account_id": {
                                "type": "string",
                                "description": "Account ID (uses default from config if not provided)",
                            },
                            "namespace_id": {
                                "type": "string",
                                "description": "The KV namespace ID",
                            },
                            "prefix": {
                                "type": "string",
                                "description": "Filter keys by prefix",
                            },
                            "limit": {
                                "type": "number",
                                "description": "Maximum number of keys to return (default: 1000)",
                            },
                            "cursor": {
                                "type": "string",
                                "description": "Cursor for pagination",
                            },
                        },
                        "required": ["namespace_id"],
                    },
                ),
                Tool(
                    name="get_zone_analytics",
                    description="Get analytics data for a zone including requests, bandwidth, threats, and pageviews.",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "zone_id": {"type": "string", "description": "The zone ID"},
                            "since": {
                                "type": "string",
                                "description": "Start time (ISO 8601 format or relative like '-1440' for last 24h)",
                            },
                            "until": {
                                "type": "string",
                                "description": "End time (ISO 8601 format or relative like '-0')",
                            },
                        },
                        "required": ["zone_id"],
                    },
                ),
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: Any) -> list[TextContent]:
            """Handle tool calls."""
            try:
                if name == "list_zones":
                    result = await self._list_zones(arguments)
                elif name == "get_zone":
                    result = await self._get_zone(arguments)
                elif name == "list_dns_records":
                    result = await self._list_dns_records(arguments)
                elif name == "create_dns_record":
                    result = await self._create_dns_record(arguments)
                elif name == "update_dns_record":
                    result = await self._update_dns_record(arguments)
                elif name == "delete_dns_record":
                    result = await self._delete_dns_record(arguments)
                elif name == "purge_cache":
                    result = await self._purge_cache(arguments)
                elif name == "list_kv_namespaces":
                    result = await self._list_kv_namespaces(arguments)
                elif name == "read_kv_value":
                    result = await self._read_kv_value(arguments)
                elif name == "write_kv_value":
                    result = await self._write_kv_value(arguments)
                elif name == "delete_kv_value":
                    result = await self._delete_kv_value(arguments)
                elif name == "list_kv_keys":
                    result = await self._list_kv_keys(arguments)
                elif name == "get_zone_analytics":
                    result = await self._get_zone_analytics(arguments)
                else:
                    raise ValueError(f"Unknown tool: {name}")

                return [TextContent(type="text", text=json.dumps(result, indent=2))]

            except Exception as e:
                return [TextContent(type="text", text=f"Error: {str(e)}")]

    # Tool implementations
    async def _list_zones(self, args: dict) -> Any:
        """List zones."""
        params = {}
        if args.get("name"):
            params["name"] = args["name"]
        if args.get("status"):
            params["status"] = args["status"]
        if args.get("page"):
            params["page"] = args["page"]
        if args.get("per_page"):
            params["per_page"] = args["per_page"]

        return await self._make_request("/zones", params=params)

    async def _get_zone(self, args: dict) -> Any:
        """Get zone details."""
        return await self._make_request(f"/zones/{args['zone_id']}")

    async def _list_dns_records(self, args: dict) -> Any:
        """List DNS records."""
        params = {}
        if args.get("type"):
            params["type"] = args["type"]
        if args.get("name"):
            params["name"] = args["name"]
        if args.get("content"):
            params["content"] = args["content"]
        if args.get("page"):
            params["page"] = args["page"]
        if args.get("per_page"):
            params["per_page"] = args["per_page"]

        return await self._make_request(
            f"/zones/{args['zone_id']}/dns_records", params=params
        )

    async def _create_dns_record(self, args: dict) -> Any:
        """Create DNS record."""
        data = {
            "type": args["type"],
            "name": args["name"],
            "content": args["content"],
            "ttl": args.get("ttl", 1),
        }

        if "proxied" in args:
            data["proxied"] = args["proxied"]
        if "priority" in args:
            data["priority"] = args["priority"]
        if "comment" in args:
            data["comment"] = args["comment"]

        return await self._make_request(
            f"/zones/{args['zone_id']}/dns_records", method="POST", data=data
        )

    async def _update_dns_record(self, args: dict) -> Any:
        """Update DNS record."""
        data = {
            "type": args["type"],
            "name": args["name"],
            "content": args["content"],
        }

        if "ttl" in args:
            data["ttl"] = args["ttl"]
        if "proxied" in args:
            data["proxied"] = args["proxied"]
        if "priority" in args:
            data["priority"] = args["priority"]
        if "comment" in args:
            data["comment"] = args["comment"]

        return await self._make_request(
            f"/zones/{args['zone_id']}/dns_records/{args['record_id']}",
            method="PUT",
            data=data,
        )

    async def _delete_dns_record(self, args: dict) -> Any:
        """Delete DNS record."""
        return await self._make_request(
            f"/zones/{args['zone_id']}/dns_records/{args['record_id']}",
            method="DELETE",
        )

    async def _purge_cache(self, args: dict) -> Any:
        """Purge cache."""
        data = {}

        if args.get("purge_everything"):
            data["purge_everything"] = True
        else:
            if args.get("files"):
                data["files"] = args["files"]
            if args.get("tags"):
                data["tags"] = args["tags"]
            if args.get("hosts"):
                data["hosts"] = args["hosts"]

        return await self._make_request(
            f"/zones/{args['zone_id']}/purge_cache", method="POST", data=data
        )

    async def _list_kv_namespaces(self, args: dict) -> Any:
        """List KV namespaces."""
        account_id = args.get("account_id") or self.account_id
        if not account_id:
            raise ValueError("Account ID is required. Provide it in args or config.")

        params = {}
        if args.get("page"):
            params["page"] = args["page"]
        if args.get("per_page"):
            params["per_page"] = args["per_page"]

        return await self._make_request(
            f"/accounts/{account_id}/storage/kv/namespaces", params=params
        )

    async def _read_kv_value(self, args: dict) -> str:
        """Read KV value."""
        account_id = args.get("account_id") or self.account_id
        if not account_id:
            raise ValueError("Account ID is required. Provide it in args or config.")

        url = f"{CLOUDFLARE_API_BASE}/accounts/{account_id}/storage/kv/namespaces/{args['namespace_id']}/values/{args['key']}"
        headers = {"Authorization": f"Bearer {self.api_token}"}

        response = await self.client.get(url, headers=headers)
        response.raise_for_status()

        return response.text

    async def _write_kv_value(self, args: dict) -> str:
        """Write KV value."""
        account_id = args.get("account_id") or self.account_id
        if not account_id:
            raise ValueError("Account ID is required. Provide it in args or config.")

        url = f"{CLOUDFLARE_API_BASE}/accounts/{account_id}/storage/kv/namespaces/{args['namespace_id']}/values/{args['key']}"

        params = {}
        if args.get("expiration_ttl"):
            params["expiration_ttl"] = args["expiration_ttl"]
        if args.get("metadata"):
            params["metadata"] = json.dumps(args["metadata"])

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "text/plain",
        }

        response = await self.client.put(
            url, content=args["value"], params=params, headers=headers
        )
        response.raise_for_status()

        return "KV value written successfully"

    async def _delete_kv_value(self, args: dict) -> str:
        """Delete KV value."""
        account_id = args.get("account_id") or self.account_id
        if not account_id:
            raise ValueError("Account ID is required. Provide it in args or config.")

        url = f"{CLOUDFLARE_API_BASE}/accounts/{account_id}/storage/kv/namespaces/{args['namespace_id']}/values/{args['key']}"
        headers = {"Authorization": f"Bearer {self.api_token}"}

        response = await self.client.delete(url, headers=headers)
        response.raise_for_status()

        return "KV value deleted successfully"

    async def _list_kv_keys(self, args: dict) -> Any:
        """List KV keys."""
        account_id = args.get("account_id") or self.account_id
        if not account_id:
            raise ValueError("Account ID is required. Provide it in args or config.")

        params = {}
        if args.get("prefix"):
            params["prefix"] = args["prefix"]
        if args.get("limit"):
            params["limit"] = args["limit"]
        if args.get("cursor"):
            params["cursor"] = args["cursor"]

        return await self._make_request(
            f"/accounts/{account_id}/storage/kv/namespaces/{args['namespace_id']}/keys",
            params=params,
        )

    async def _get_zone_analytics(self, args: dict) -> Any:
        """Get zone analytics."""
        params = {}
        if args.get("since"):
            params["since"] = args["since"]
        if args.get("until"):
            params["until"] = args["until"]

        return await self._make_request(
            f"/zones/{args['zone_id']}/analytics/dashboard", params=params
        )

    async def run(self):
        """Run the MCP server."""
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                self.server.create_initialization_options(),
            )

    async def cleanup(self):
        """Cleanup resources."""
        await self.client.aclose()


def main():
    """Main entry point."""
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")

    if not api_token:
        raise ValueError("CLOUDFLARE_API_TOKEN environment variable is required")

    server = CloudflareMCPServer(api_token, account_id)

    try:
        asyncio.run(server.run())
    finally:
        asyncio.run(server.cleanup())


if __name__ == "__main__":
    main()
