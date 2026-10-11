"""Smoke tests: the package imports and exposes its entrypoint."""

import cloudflare_mcp_server


def test_module_exposes_entrypoint():
    assert callable(cloudflare_mcp_server.main)


def test_module_exposes_server_class():
    assert cloudflare_mcp_server.CloudflareMCPServer is not None
