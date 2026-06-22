---
name: tools-packaging
description: Build & distribute — npm, Cargo, PyPI, Docker, Homebrew. Cross-platform, CI/CD, auto-update.
---

# tools-packaging — Build & Distribute

## npm Package
See `templates/npm/package.json`.

```bash
npm publish              # public package
npm publish --tag beta   # beta channel
npm deprecate @scope/my-tool@"<1.0" "Please upgrade to v1"
```

## Rust Cargo
See `templates/cargo/Cargo.toml`.

```bash
cargo publish
cargo install my-tool     # User install
```

## Python PyPI
See `templates/pypi/pyproject.toml`.

```bash
python -m build
twine upload dist/*
pip install my-tool
```

## Docker
See `templates/docker/Dockerfile`.

```bash
docker build -t my-tool .
docker run my-tool --help
```

## GitHub Actions CI
See `templates/.github/release.yml`.

Triggers on tag push `v*`. Runs tests + publishes to npm. Adjust `setup-node` registry for other registries.
