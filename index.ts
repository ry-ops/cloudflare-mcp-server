#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

interface CloudflareConfig {
  apiToken: string;
  accountId?: string;
}

const CLOUDFLARE_API_BASE = "https://api.cloudflare.com/client/v4";

class CloudflareMCPServer {
  private server: Server;
  private config: CloudflareConfig;

  constructor(config: CloudflareConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: "cloudflare-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private async makeCloudflareRequest(
    endpoint: string,
    method: string = "GET",
    body?: any
  ): Promise<any> {
    const url = `${CLOUDFLARE_API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiToken}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(
        `Cloudflare API error: ${JSON.stringify(data.errors || data)}`
      );
    }

    return data.result;
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "list_zones":
            return await this.listZones(args);
          case "get_zone":
            return await this.getZone(args);
          case "list_dns_records":
            return await this.listDnsRecords(args);
          case "create_dns_record":
            return await this.createDnsRecord(args);
          case "update_dns_record":
            return await this.updateDnsRecord(args);
          case "delete_dns_record":
            return await this.deleteDnsRecord(args);
          case "purge_cache":
            return await this.purgeCache(args);
          case "list_kv_namespaces":
            return await this.listKVNamespaces(args);
          case "read_kv_value":
            return await this.readKVValue(args);
          case "write_kv_value":
            return await this.writeKVValue(args);
          case "delete_kv_value":
            return await this.deleteKVValue(args);
          case "list_kv_keys":
            return await this.listKVKeys(args);
          case "get_zone_analytics":
            return await this.getZoneAnalytics(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "list_zones",
        description:
          "List all zones (domains) in the Cloudflare account. Returns zone details including ID, name, status, and nameservers.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Filter zones by name (optional)",
            },
            status: {
              type: "string",
              description: "Filter by status: active, pending, initializing, moved, deleted, deactivated (optional)",
            },
            page: {
              type: "number",
              description: "Page number for pagination (default: 1)",
            },
            per_page: {
              type: "number",
              description: "Number of zones per page (default: 20, max: 50)",
            },
          },
        },
      },
      {
        name: "get_zone",
        description:
          "Get detailed information about a specific zone by zone ID",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
          },
          required: ["zone_id"],
        },
      },
      {
        name: "list_dns_records",
        description:
          "List DNS records for a zone. Can filter by type, name, content, etc.",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            type: {
              type: "string",
              description: "DNS record type (A, AAAA, CNAME, TXT, MX, etc.)",
            },
            name: {
              type: "string",
              description: "DNS record name to filter by",
            },
            content: {
              type: "string",
              description: "DNS record content to filter by",
            },
            page: {
              type: "number",
              description: "Page number for pagination",
            },
            per_page: {
              type: "number",
              description: "Number of records per page (max: 100)",
            },
          },
          required: ["zone_id"],
        },
      },
      {
        name: "create_dns_record",
        description:
          "Create a new DNS record in a zone. Supports all DNS record types.",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            type: {
              type: "string",
              description: "DNS record type (A, AAAA, CNAME, TXT, MX, etc.)",
            },
            name: {
              type: "string",
              description: "DNS record name (e.g., 'www' or '@' for root)",
            },
            content: {
              type: "string",
              description: "DNS record content (e.g., IP address, hostname)",
            },
            ttl: {
              type: "number",
              description: "Time to live (1 = automatic, or 120-86400 seconds)",
              default: 1,
            },
            proxied: {
              type: "boolean",
              description: "Whether the record is proxied through Cloudflare (only for A, AAAA, CNAME)",
              default: false,
            },
            priority: {
              type: "number",
              description: "Priority (for MX, SRV records)",
            },
            comment: {
              type: "string",
              description: "Comment for the DNS record",
            },
          },
          required: ["zone_id", "type", "name", "content"],
        },
      },
      {
        name: "update_dns_record",
        description:
          "Update an existing DNS record. Can modify type, name, content, TTL, proxy status, etc.",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            record_id: {
              type: "string",
              description: "The DNS record ID to update",
            },
            type: {
              type: "string",
              description: "DNS record type",
            },
            name: {
              type: "string",
              description: "DNS record name",
            },
            content: {
              type: "string",
              description: "DNS record content",
            },
            ttl: {
              type: "number",
              description: "Time to live",
            },
            proxied: {
              type: "boolean",
              description: "Whether the record is proxied through Cloudflare",
            },
            priority: {
              type: "number",
              description: "Priority (for MX, SRV records)",
            },
            comment: {
              type: "string",
              description: "Comment for the DNS record",
            },
          },
          required: ["zone_id", "record_id", "type", "name", "content"],
        },
      },
      {
        name: "delete_dns_record",
        description: "Delete a DNS record from a zone",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            record_id: {
              type: "string",
              description: "The DNS record ID to delete",
            },
          },
          required: ["zone_id", "record_id"],
        },
      },
      {
        name: "purge_cache",
        description:
          "Purge Cloudflare's cache for a zone. Can purge everything or specific files/tags/hosts.",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            purge_everything: {
              type: "boolean",
              description: "Purge all cached content (use cautiously!)",
            },
            files: {
              type: "array",
              items: { type: "string" },
              description: "Array of URLs to purge",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Array of cache tags to purge",
            },
            hosts: {
              type: "array",
              items: { type: "string" },
              description: "Array of hosts to purge",
            },
          },
          required: ["zone_id"],
        },
      },
      {
        name: "list_kv_namespaces",
        description:
          "List all Workers KV namespaces in the account. KV is Cloudflare's key-value storage.",
        inputSchema: {
          type: "object",
          properties: {
            account_id: {
              type: "string",
              description: "Account ID (uses default from config if not provided)",
            },
            page: {
              type: "number",
              description: "Page number for pagination",
            },
            per_page: {
              type: "number",
              description: "Number of namespaces per page",
            },
          },
        },
      },
      {
        name: "read_kv_value",
        description:
          "Read a value from Workers KV storage by key. Returns the stored value.",
        inputSchema: {
          type: "object",
          properties: {
            account_id: {
              type: "string",
              description: "Account ID (uses default from config if not provided)",
            },
            namespace_id: {
              type: "string",
              description: "The KV namespace ID",
            },
            key: {
              type: "string",
              description: "The key to read",
            },
          },
          required: ["namespace_id", "key"],
        },
      },
      {
        name: "write_kv_value",
        description:
          "Write a key-value pair to Workers KV storage. Can store text or metadata.",
        inputSchema: {
          type: "object",
          properties: {
            account_id: {
              type: "string",
              description: "Account ID (uses default from config if not provided)",
            },
            namespace_id: {
              type: "string",
              description: "The KV namespace ID",
            },
            key: {
              type: "string",
              description: "The key to write",
            },
            value: {
              type: "string",
              description: "The value to store",
            },
            expiration_ttl: {
              type: "number",
              description: "Number of seconds for the key to expire",
            },
            metadata: {
              type: "object",
              description: "Arbitrary JSON metadata to store with the key",
            },
          },
          required: ["namespace_id", "key", "value"],
        },
      },
      {
        name: "delete_kv_value",
        description: "Delete a key from Workers KV storage",
        inputSchema: {
          type: "object",
          properties: {
            account_id: {
              type: "string",
              description: "Account ID (uses default from config if not provided)",
            },
            namespace_id: {
              type: "string",
              description: "The KV namespace ID",
            },
            key: {
              type: "string",
              description: "The key to delete",
            },
          },
          required: ["namespace_id", "key"],
        },
      },
      {
        name: "list_kv_keys",
        description:
          "List all keys in a Workers KV namespace. Supports pagination and prefix filtering.",
        inputSchema: {
          type: "object",
          properties: {
            account_id: {
              type: "string",
              description: "Account ID (uses default from config if not provided)",
            },
            namespace_id: {
              type: "string",
              description: "The KV namespace ID",
            },
            prefix: {
              type: "string",
              description: "Filter keys by prefix",
            },
            limit: {
              type: "number",
              description: "Maximum number of keys to return (default: 1000)",
            },
            cursor: {
              type: "string",
              description: "Cursor for pagination",
            },
          },
          required: ["namespace_id"],
        },
      },
      {
        name: "get_zone_analytics",
        description:
          "Get analytics data for a zone including requests, bandwidth, threats, and pageviews.",
        inputSchema: {
          type: "object",
          properties: {
            zone_id: {
              type: "string",
              description: "The zone ID",
            },
            since: {
              type: "string",
              description: "Start time (ISO 8601 format or relative like '-1440' for last 24h)",
            },
            until: {
              type: "string",
              description: "End time (ISO 8601 format or relative like '-0')",
            },
          },
          required: ["zone_id"],
        },
      },
    ];
  }

  // Tool implementations
  private async listZones(args: any) {
    const params = new URLSearchParams();
    if (args.name) params.append("name", args.name);
    if (args.status) params.append("status", args.status);
    if (args.page) params.append("page", args.page.toString());
    if (args.per_page) params.append("per_page", args.per_page.toString());

    const queryString = params.toString();
    const endpoint = `/zones${queryString ? `?${queryString}` : ""}`;
    const result = await this.makeCloudflareRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getZone(args: any) {
    const result = await this.makeCloudflareRequest(`/zones/${args.zone_id}`);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async listDnsRecords(args: any) {
    const params = new URLSearchParams();
    if (args.type) params.append("type", args.type);
    if (args.name) params.append("name", args.name);
    if (args.content) params.append("content", args.content);
    if (args.page) params.append("page", args.page.toString());
    if (args.per_page) params.append("per_page", args.per_page.toString());

    const queryString = params.toString();
    const endpoint = `/zones/${args.zone_id}/dns_records${queryString ? `?${queryString}` : ""}`;
    const result = await this.makeCloudflareRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async createDnsRecord(args: any) {
    const body: any = {
      type: args.type,
      name: args.name,
      content: args.content,
      ttl: args.ttl || 1,
    };

    if (args.proxied !== undefined) body.proxied = args.proxied;
    if (args.priority !== undefined) body.priority = args.priority;
    if (args.comment) body.comment = args.comment;

    const result = await this.makeCloudflareRequest(
      `/zones/${args.zone_id}/dns_records`,
      "POST",
      body
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async updateDnsRecord(args: any) {
    const body: any = {
      type: args.type,
      name: args.name,
      content: args.content,
    };

    if (args.ttl !== undefined) body.ttl = args.ttl;
    if (args.proxied !== undefined) body.proxied = args.proxied;
    if (args.priority !== undefined) body.priority = args.priority;
    if (args.comment !== undefined) body.comment = args.comment;

    const result = await this.makeCloudflareRequest(
      `/zones/${args.zone_id}/dns_records/${args.record_id}`,
      "PUT",
      body
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async deleteDnsRecord(args: any) {
    const result = await this.makeCloudflareRequest(
      `/zones/${args.zone_id}/dns_records/${args.record_id}`,
      "DELETE"
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async purgeCache(args: any) {
    const body: any = {};

    if (args.purge_everything) {
      body.purge_everything = true;
    } else {
      if (args.files) body.files = args.files;
      if (args.tags) body.tags = args.tags;
      if (args.hosts) body.hosts = args.hosts;
    }

    const result = await this.makeCloudflareRequest(
      `/zones/${args.zone_id}/purge_cache`,
      "POST",
      body
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async listKVNamespaces(args: any) {
    const accountId = args.account_id || this.config.accountId;
    if (!accountId) {
      throw new Error("Account ID is required. Provide it in args or config.");
    }

    const params = new URLSearchParams();
    if (args.page) params.append("page", args.page.toString());
    if (args.per_page) params.append("per_page", args.per_page.toString());

    const queryString = params.toString();
    const endpoint = `/accounts/${accountId}/storage/kv/namespaces${queryString ? `?${queryString}` : ""}`;
    const result = await this.makeCloudflareRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async readKVValue(args: any) {
    const accountId = args.account_id || this.config.accountId;
    if (!accountId) {
      throw new Error("Account ID is required. Provide it in args or config.");
    }

    const url = `${CLOUDFLARE_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${args.namespace_id}/values/${args.key}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to read KV value: ${response.statusText}`);
    }

    const value = await response.text();

    return {
      content: [
        {
          type: "text",
          text: value,
        },
      ],
    };
  }

  private async writeKVValue(args: any) {
    const accountId = args.account_id || this.config.accountId;
    if (!accountId) {
      throw new Error("Account ID is required. Provide it in args or config.");
    }

    const url = `${CLOUDFLARE_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${args.namespace_id}/values/${args.key}`;
    const params = new URLSearchParams();
    if (args.expiration_ttl) params.append("expiration_ttl", args.expiration_ttl.toString());
    if (args.metadata) params.append("metadata", JSON.stringify(args.metadata));

    const queryString = params.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(finalUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "text/plain",
      },
      body: args.value,
    });

    if (!response.ok) {
      throw new Error(`Failed to write KV value: ${response.statusText}`);
    }

    return {
      content: [
        {
          type: "text",
          text: "KV value written successfully",
        },
      ],
    };
  }

  private async deleteKVValue(args: any) {
    const accountId = args.account_id || this.config.accountId;
    if (!accountId) {
      throw new Error("Account ID is required. Provide it in args or config.");
    }

    const url = `${CLOUDFLARE_API_BASE}/accounts/${accountId}/storage/kv/namespaces/${args.namespace_id}/values/${args.key}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete KV value: ${response.statusText}`);
    }

    return {
      content: [
        {
          type: "text",
          text: "KV value deleted successfully",
        },
      ],
    };
  }

  private async listKVKeys(args: any) {
    const accountId = args.account_id || this.config.accountId;
    if (!accountId) {
      throw new Error("Account ID is required. Provide it in args or config.");
    }

    const params = new URLSearchParams();
    if (args.prefix) params.append("prefix", args.prefix);
    if (args.limit) params.append("limit", args.limit.toString());
    if (args.cursor) params.append("cursor", args.cursor);

    const queryString = params.toString();
    const endpoint = `/accounts/${accountId}/storage/kv/namespaces/${args.namespace_id}/keys${queryString ? `?${queryString}` : ""}`;
    const result = await this.makeCloudflareRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async getZoneAnalytics(args: any) {
    const params = new URLSearchParams();
    if (args.since) params.append("since", args.since);
    if (args.until) params.append("until", args.until);

    const queryString = params.toString();
    const endpoint = `/zones/${args.zone_id}/analytics/dashboard${queryString ? `?${queryString}` : ""}`;
    const result = await this.makeCloudflareRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Cloudflare MCP Server running on stdio");
  }
}

// Main execution
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!apiToken) {
  console.error("Error: CLOUDFLARE_API_TOKEN environment variable is required");
  process.exit(1);
}

const server = new CloudflareMCPServer({
  apiToken,
  accountId,
});

server.run().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
