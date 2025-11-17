#!/usr/bin/env python
"""Setup script for backward compatibility."""

from setuptools import setup, find_packages

setup(
    name="connectors-sdk",
    packages=find_packages(exclude=["tests", "tests.*"]),
    package_data={
        "connectors": ["py.typed"],
    },
)
