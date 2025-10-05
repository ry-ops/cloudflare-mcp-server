# Cloudflare MCP Server - Usage Examples

This document provides practical examples of common tasks you can accomplish with Claude using the Cloudflare MCP Server.

## Table of Contents
1. [DNS Management](#dns-management)
2. [Zone Operations](#zone-operations)
3. [Cache Management](#cache-management)
4. [Workers KV](#workers-kv)
5. [Analytics](#analytics)
6. [Advanced Workflows](#advanced-workflows)

---

## DNS Management

### Example 1: List All DNS Records

**You ask Claude:**
> "Show me all DNS records for example.com"

**What happens:**
1. Claude uses `list_zones` to find the zone ID for example.com
2. Claude uses `list_dns_records` with that zone ID
3. You get a formatted list of all DNS records

---

### Example 2: Create an A Record

**You ask Claude:**
> "Create an A record for api.example.com pointing to 192.0.2.100, and make sure it's proxied through Cloudflare"

**What happens:**
1. Claude finds your zone ID
2. Claude uses `create_dns_record` with:
   - type: "A"
   - name: "api"
   - content: "192.0.2.100"
   - proxied: true
3. Confirms the record was created

---

### Example 3: Update DNS Record

**You ask Claude:**
> "Change the IP address of www.example.com to 203.0.113.50"

**What happens:**
1. Claude lists DNS records to find the www record
2. Claude uses `update_dns_record` with the new IP
3. Confirms the update

---

### Example 4: Create Multiple Records at Once

**You ask Claude:**
> "Set up DNS for my new service: 
> - api.example.com → 192.0.2.10
> - db.example.com → 192.0.2.20  
> - cache.example.com → 192.0.2.30
> All should be A records, not proxied"

**What happens:**
Claude creates three A records using `create_dns_record` for each.

---

### Example 5: Find and Delete Old Records

**You ask Claude:**
> "Find all TXT records for example.com and delete any that start with 'old-verification'"

**What happens:**
1. Claude lists TXT records using `list_dns_records` with type filter
2. Identifies matching records
3. Uses `delete_dns_record` for each matching record
4. Confirms deletions

---

## Zone Operations

### Example 6: List All Your Domains

**You ask Claude:**
> "What domains do I have in my Cloudflare account?"

**What happens:**
Claude uses `list_zones` and shows you all your zones with their status.

---

### Example 7: Get Zone Details

**You ask Claude:**
> "Tell me everything about my example.com zone - nameservers, status, plan, etc."

**What happens:**
Claude uses `get_zone` to retrieve comprehensive zone information.

---

### Example 8: Find Active Zones

**You ask Claude:**
> "Show me only my active zones"

**What happens:**
Claude uses `list_zones` with status filter set to "active".

---

## Cache Management

### Example 9: Purge Entire Cache

**You ask Claude:**
> "Clear all cached content for example.com"

**What happens:**
Claude uses `purge_cache` with `purge_everything: true` (after confirming with you).

---

### Example 10: Purge Specific Files

**You ask Claude:**
> "I just updated style.css and app.js on example.com. Can you clear the cache for those?"

**What happens:**
Claude uses `purge_cache` with the files array:
```json
{
  "files": [
    "https://example.com/style.css",
    "https://example.com/app.js"
  ]
}
```

---

### Example 11: Purge by Cache Tag

**You ask Claude:**
> "Clear all cached content tagged as 'blog-posts'"

**What happens:**
Claude uses `purge_cache` with tags array:
```json
{
  "tags": ["blog-posts"]
}
```

---

## Workers KV

### Example 12: List KV Namespaces

**You ask Claude:**
> "What KV namespaces do I have?"

**What happens:**
Claude uses `list_kv_namespaces` to show all your namespaces.

---

### Example 13: Store Configuration

**You ask Claude:**
> "Store this API configuration in my KV namespace:
> Key: 'api-config'
> Value: { 'endpoint': 'https://api.example.com', 'timeout': 5000 }"

**What happens:**
Claude uses `write_kv_value` to store the configuration as a JSON string.

---

### Example 14: Read Configuration

**You ask Claude:**
> "What's stored in the 'api-config' key in my production namespace?"

**What happens:**
1. Claude finds your production namespace ID
2. Uses `read_kv_value` to retrieve the value
3. Formats and displays it

---

### Example 15: Store with Expiration

**You ask Claude:**
> "Store a temporary API token in KV that expires in 1 hour. Key: 'temp-token', Value: 'abc123xyz'"

**What happens:**
Claude uses `write_kv_value` with `expiration_ttl: 3600`.

---

### Example 16: List All Keys with Prefix

**You ask Claude:**
> "Show me all keys in my KV namespace that start with 'user:'"

**What happens:**
Claude uses `list_kv_keys` with `prefix: "user:"`.

---

## Analytics

### Example 17: Get Traffic Stats

**You ask Claude:**
> "How much traffic did example.com get in the last 24 hours?"

**What happens:**
Claude uses `get_zone_analytics` with appropriate time range to show requests, bandwidth, and threats.

---

### Example 18: Compare Weekly Traffic

**You ask Claude:**
> "Compare this week's traffic to last week for example.com"

**What happens:**
1. Claude gets analytics for this week
2. Claude gets analytics for last week
3. Presents a comparison

---

## Advanced Workflows

### Example 19: Deploy New Service

**You ask Claude:**
> "I'm deploying a new microservice. Set up:
> 1. DNS A record for service.example.com → 192.0.2.100
> 2. Store the service config in KV under 'service:config'
> 3. Clear any cached content at /api/*"

**What happens:**
Claude executes all three operations in sequence and confirms each step.

---

### Example 20: Disaster Recovery

**You ask Claude:**
> "Emergency! I need to:
> 1. Point www.example.com to our backup server at 203.0.113.100
> 2. Purge all cache immediately
> 3. Show me the current status"

**What happens:**
1. Claude updates the DNS record
2. Purges the cache
3. Shows current zone status

---

### Example 21: Audit DNS Records

**You ask Claude:**
> "Audit my DNS records and tell me:
> - How many records I have
> - Which records are proxied vs direct
> - Any suspicious or unusual records"

**What happens:**
1. Claude lists all DNS records
2. Analyzes them
3. Provides a summary report

---

### Example 22: Migrate DNS Records

**You ask Claude:**
> "I'm moving from old-domain.com to new-domain.com. Can you:
> 1. Show me all A records from old-domain.com
> 2. Help me create equivalent records on new-domain.com"

**What happens:**
1. Claude lists records from the old zone
2. Suggests equivalent records for the new zone
3. Creates them with your confirmation

---

### Example 23: Bulk Update TTL

**You ask Claude:**
> "Change the TTL to 300 seconds for all my A records on example.com"

**What happens:**
1. Claude lists all A records
2. Updates each one with TTL: 300
3. Confirms all changes

---

### Example 24: KV Backup

**You ask Claude:**
> "Export all keys and values from my 'production' KV namespace"

**What happens:**
1. Claude lists all keys using `list_kv_keys`
2. Reads each value using `read_kv_value`
3. Formats them as a backup

---

### Example 25: Setup Development Environment

**You ask Claude:**
> "Set up DNS for my dev environment:
> - dev.example.com → 192.0.2.200
> - api-dev.example.com → 192.0.2.201
> - db-dev.example.com → 192.0.2.202
> None should be proxied, and use automatic TTL"

**What happens:**
Claude creates all three records with the specified configuration.

---

## Tips for Best Results

1. **Be specific**: "Change www to point to 192.0.2.1" is better than "update DNS"
2. **Provide context**: Mention the domain name explicitly
3. **Confirm destructive actions**: Claude will ask before purging cache or deleting records
4. **Use natural language**: Claude understands conversational requests
5. **Iterate**: If the first result isn't perfect, ask Claude to adjust it

## Common Patterns

### Safe Updates
> "Show me the current DNS record for api.example.com before we change it"

### Verification
> "After creating that record, show me the updated list to verify"

### Batch Operations
> "Do the same thing for api.example.com, web.example.com, and app.example.com"

### Conditional Actions
> "If there's already a record for test.example.com, update it. Otherwise, create a new one."

---

Need more examples? Just ask Claude for help with your specific use case!
