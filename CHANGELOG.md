# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-05

### Added
- Initial release of Cloudflare MCP Server (Python version)
- Built with Python 3.10+ and async/await
- Managed with uv for fast dependency management
- Zone management tools (list_zones, get_zone)
- DNS record management (list, create, update, delete)
- Cache purging capabilities (purge_cache)
- Workers KV operations (list, read, write, delete namespaces and keys)
- Zone analytics retrieval
- Comprehensive documentation (README, QUICKSTART, EXAMPLES, CONTRIBUTING)
- Full type hints for better IDE support
- Error handling for all API operations
- Support for pagination in list operations
- Filter support for DNS records and zones
- httpx async client for reliable HTTP requests

### Features by Category

#### DNS Management
- Create DNS records (A, AAAA, CNAME, TXT, MX, and more)
- Update existing DNS records
- Delete DNS records
- List and filter DNS records by type, name, content
- Support for proxied records
- Custom TTL configuration
- Priority support for MX/SRV records
- Record comments support

#### Zone Operations
- List all zones with filtering
- Get detailed zone information
- Filter by zone status
- Pagination support

#### Cache Management  
- Purge entire zone cache
- Purge specific files by URL
- Purge by cache tags
- Purge by hostname

#### Workers KV
- List all KV namespaces
- Read values from KV storage
- Write values with optional TTL
- Delete keys from KV
- List keys with prefix filtering
- Metadata support for key-value pairs
- Pagination for key listings

#### Analytics
- Retrieve zone analytics
- Customizable time ranges
- Traffic and bandwidth statistics
- Threat and security metrics

### Technical Details
- Built with Python 3.10+
- Uses MCP SDK (Python) v1.1.2+
- httpx for async HTTP requests
- Full async/await support
- Type hints throughout
- uv-compatible pyproject.toml
- ruff for linting and formatting
- Comprehensive error handling
- JSON response formatting

### Development Features
- uv support for fast package management
- Editable install with `uv pip install -e .`
- Dev dependencies for testing and linting
- ruff configuration for code quality
- pytest-ready structure (tests to be implemented)

## [Unreleased]

### Planned Features
- Automated tests with pytest
- Cloudflare Workers script management
- R2 storage operations
- Pages deployment management
- Load Balancer configuration
- Stream video operations
- Email routing configuration
- WAF rule management
- Rate limiting configuration
- Better error messages
- Rate limit handling
- Batch operations
- Response caching

### Improvements
- Add mypy for static type checking
- Add more comprehensive tests
- Improve error messages
- Add request retry logic
- Add response validation

---

## Version History

### Format
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes

---

## Migration from Node.js Version

This is a complete rewrite in Python. Key differences:
- Uses Python's async/await instead of TypeScript/Node.js
- Managed with uv instead of npm
- Uses httpx instead of fetch
- Uses MCP Python SDK instead of TypeScript SDK
- Same functionality, different implementation

*Note: This is version 1.0.0 - the initial Python release.*
