# Contributing to Cloudflare MCP Server (Python)

Thank you for your interest in contributing! This document provides guidelines for contributing to the Python version of the Cloudflare MCP Server.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/cloudflare-mcp-server.git`
3. Install dependencies: `uv pip install -e ".[dev]"`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Python 3.10 or higher
- [uv](https://github.com/astral-sh/uv) installed (recommended)
- A Cloudflare account with API token for testing

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Cloudflare credentials to `.env`:
   ```
   CLOUDFLARE_API_TOKEN=your_test_token
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   ```

### Installing Dependencies

```bash
# With uv (recommended - super fast!)
uv pip install -e ".[dev]"

# Or with regular pip
pip install -e ".[dev]"
```

### Running the Server

```bash
# Set environment variables
export CLOUDFLARE_API_TOKEN="your_token"
export CLOUDFLARE_ACCOUNT_ID="your_account_id"

# Run with uv
uv run cloudflare-mcp-server

# Or run directly with Python
python -m cloudflare_mcp_server
```

## Project Structure

```
cloudflare-mcp-server/
├── src/
│   └── cloudflare_mcp_server/
│       └── __init__.py        # Main server implementation
├── tests/                     # Tests (to be implemented)
├── pyproject.toml            # Project configuration
├── README.md                 # Main documentation
├── QUICKSTART.md            # Quick start guide
├── EXAMPLES.md              # Usage examples
└── CONTRIBUTING.md          # This file
```

## Code Style

We use [ruff](https://github.com/astral-sh/ruff) for linting and formatting.

### Format Code

```bash
uv run ruff format src/
```

### Lint Code

```bash
uv run ruff check src/
```

### Python Style Guidelines

- Follow PEP 8
- Use type hints for function signatures
- Use docstrings for public functions and classes
- Keep functions focused and single-purpose
- Use descriptive variable names

Example:

```python
async def create_dns_record(self, args: dict[str, Any]) -> dict[str, Any]:
    """
    Create a new DNS record in the specified zone.
    
    Args:
        args: Dictionary containing zone_id, type, name, content, and optional params
        
    Returns:
        Dictionary containing the created DNS record details
        
    Raises:
        ValueError: If required parameters are missing
        Exception: If the Cloudflare API request fails
    """
    # Implementation here
    pass
```

## Adding New Tools

To add a new tool to the MCP server:

1. **Add the tool definition in `list_tools()` handler:**

```python
Tool(
    name="your_tool_name",
    description="Clear description of what the tool does",
    inputSchema={
        "type": "object",
        "properties": {
            "param1": {
                "type": "string",
                "description": "Description of param1",
            },
            # ... more parameters
        },
        "required": ["param1"],
    },
)
```

2. **Add the tool handler in `call_tool()` function:**

```python
elif name == "your_tool_name":
    result = await self._your_tool_name(arguments)
```

3. **Implement the tool method:**

```python
async def _your_tool_name(self, args: dict[str, Any]) -> Any:
    """Tool description."""
    # Make API call
    return await self._make_request(
        "/your/endpoint",
        method="GET",  # or POST, PUT, DELETE
    )
```

4. **Update README.md** with documentation for your new tool

5. **Test thoroughly** before submitting

## Testing

Currently, this project uses manual testing. We welcome contributions for automated tests!

### Manual Testing Checklist

For new tools, verify:
- ✅ Tool appears in Claude's tool list
- ✅ Tool executes without errors
- ✅ Required parameters are enforced
- ✅ Optional parameters work correctly
- ✅ Error messages are clear and helpful
- ✅ Response format is consistent
- ✅ Documentation is accurate

### Future: Automated Tests

We plan to add `pytest` tests. Structure:

```python
import pytest
from cloudflare_mcp_server import CloudflareMCPServer

@pytest.mark.asyncio
async def test_list_zones():
    """Test listing zones."""
    server = CloudflareMCPServer(api_token="test", account_id="test")
    # Test implementation
    pass
```

## Cloudflare API Guidelines

When adding new Cloudflare API endpoints:

1. **Consult the official docs:** https://developers.cloudflare.com/api/
2. **Use proper HTTP methods:**
   - GET for reading data
   - POST for creating resources
   - PUT/PATCH for updating
   - DELETE for deleting

3. **Handle pagination** for list endpoints:
   ```python
   params = {}
   if args.get("page"):
       params["page"] = args["page"]
   if args.get("per_page"):
       params["per_page"] = args["per_page"]
   ```

4. **Include proper error handling:**
   ```python
   try:
       result = await self._make_request(endpoint)
       return result
   except Exception as e:
       raise Exception(f"Failed to do operation: {str(e)}")
   ```

## Type Hints

Use Python type hints for better code quality:

```python
from typing import Any, Optional

async def _make_request(
    self,
    endpoint: str,
    method: str = "GET",
    data: Optional[dict[str, Any]] = None,
    params: Optional[dict[str, Any]] = None,
) -> Any:
    """Make a request to the Cloudflare API."""
    pass
```

## Async/Await

This project uses async/await for all API calls:

```python
import asyncio
import httpx

async def fetch_data():
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

## Documentation

When adding features:

1. **Update README.md** with:
   - Tool description
   - Parameters table
   - Usage examples
   - Any special considerations

2. **Update QUICKSTART.md** if it affects setup

3. **Add docstrings** to functions:
   ```python
   def function_name(param: str) -> dict:
       """
       Brief description.
       
       Args:
           param: Description of parameter
           
       Returns:
           Description of return value
           
       Raises:
           ExceptionType: When this exception is raised
       """
       pass
   ```

## Commit Messages

Use clear, descriptive commit messages:

```
✅ Good:
- "Add support for Cloudflare Pages deployments"
- "Fix DNS record update parameter validation"
- "Update README with cache purging examples"

❌ Avoid:
- "fix bug"
- "update"
- "changes"
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `style`: Code style changes

## Pull Request Process

1. **Update documentation** for any changed functionality
2. **Format and lint** your code:
   ```bash
   uv run ruff format src/
   uv run ruff check src/ --fix
   ```
3. **Test your changes** thoroughly
4. **Create a clear PR description**:
   - What does this PR do?
   - Why is this change needed?
   - How was it tested?
   - Any breaking changes?

5. Wait for review and address feedback

## Feature Requests

Have an idea? Great! Here's how to suggest it:

1. **Check existing issues** to avoid duplicates
2. **Open a new issue** with:
   - Clear description of the feature
   - Use case / why it's needed
   - Example of how it would work
   - Any relevant Cloudflare API documentation

## Bug Reports

Found a bug? Help us fix it:

1. **Check existing issues** first
2. **Create a detailed bug report**:
   - What happened?
   - What did you expect?
   - Steps to reproduce
   - Error messages / logs
   - Your environment (OS, Python version, uv version)

**Security issues:** Email directly instead of creating a public issue.

## Areas for Contribution

Looking for ideas? Here are areas that need help:

### High Priority
- [ ] Add automated tests (pytest)
- [ ] Implement more Cloudflare API endpoints
- [ ] Add rate limiting handling
- [ ] Better error messages
- [ ] Type stub files (.pyi)

### Nice to Have
- [ ] Support for Cloudflare Workers management
- [ ] R2 storage operations
- [ ] Load Balancer management
- [ ] Stream video operations
- [ ] Email routing operations
- [ ] Async batch operations

### Documentation
- [ ] More usage examples
- [ ] API reference docs
- [ ] Common workflow guides
- [ ] Troubleshooting guide
- [ ] Video tutorials

## Dependencies

We minimize dependencies to keep the project lean:
- `mcp` - Model Context Protocol SDK
- `httpx` - Modern HTTP client with async support

Dev dependencies:
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support
- `ruff` - Fast Python linter and formatter

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the best solution, not winning arguments
- Assume good intentions

## Questions?

- Open an issue for technical questions
- Check existing documentation first
- Be specific about what you need help with

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make this project better! 🐍🎉
