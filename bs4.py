"""Minimal BeautifulSoup-compatible parser using only the standard library.

This is a tiny subset tailored for the scraping script. It supports:
- get_text()
- find / find_all
- select / select_one with simple tag and class selectors (comma- and space-separated)
"""
from __future__ import annotations

from html.parser import HTMLParser
from typing import Iterable, List, Optional


class _Node:
    def __init__(self, name: Optional[str], attrs: Optional[dict[str, str]] = None, parent: Optional["_Node"] = None):
        self.name = name
        self.attrs = attrs or {}
        self.parent = parent
        self.children: List[_Node] = []
        self._text_fragments: List[str] = []

    def append_text(self, value: str) -> None:
        if value:
            self._text_fragments.append(value)

    def get_text(self) -> str:
        parts: List[str] = []
        parts.extend(self._text_fragments)
        for child in self.children:
            parts.append(child.get_text())
        return "".join(parts)

    def _iter_descendants(self) -> Iterable["_Node"]:
        for child in self.children:
            yield child
            yield from child._iter_descendants()

    def _matches_token(self, token: str) -> bool:
        if not token:
            return False
        tag: Optional[str]
        classes: List[str] = []
        if token.startswith("."):
            tag = None
            classes = [token[1:]]
        else:
            if "." in token:
                tag, cls = token.split(".", 1)
                classes = [cls]
            else:
                tag = token
        if tag and self.name != tag:
            return False
        if classes:
            class_attr = self.attrs.get("class", "")
            class_values = set(class_attr.split()) if isinstance(class_attr, str) else set()
            return all(cls in class_values for cls in classes)
        return True

    def select(self, selector: str) -> List["_Node"]:
        results: List[_Node] = []
        for group in selector.split(","):
            tokens = [t for t in group.strip().split() if t]
            if not tokens:
                continue
            current: List[_Node] = [self]
            for token in tokens:
                matched: List[_Node] = []
                for node in current:
                    matched.extend([desc for desc in node._iter_descendants() if desc._matches_token(token)])
                current = matched
            results.extend(current)
        return results

    def select_one(self, selector: str) -> Optional["_Node"]:
        matches = self.select(selector)
        return matches[0] if matches else None

    def find(self, name: str) -> Optional["_Node"]:
        for child in self._iter_descendants():
            if child.name == name:
                return child
        return None

    def find_all(self, names) -> List["_Node"]:
        if isinstance(names, str):
            names = {names}
        else:
            names = set(names)
        return [node for node in self._iter_descendants() if node.name in names]

    def get(self, key: str, default=None):
        return self.attrs.get(key, default)


class BeautifulSoup(_Node):
    def __init__(self, markup: str, parser: str = "html.parser"):
        super().__init__(name=None)
        self._build_tree(markup)

    def _build_tree(self, markup: str) -> None:
        class _Parser(HTMLParser):
            def __init__(self, root: _Node):
                super().__init__()
                self.current = root

            def handle_starttag(self, tag, attrs):
                attrs_dict = {k: v if v is not None else "" for k, v in attrs}
                node = _Node(tag, attrs_dict, parent=self.current)
                self.current.children.append(node)
                self.current = node

            def handle_endtag(self, tag):
                while self.current.parent and self.current.name != tag:
                    self.current = self.current.parent
                if self.current.parent:
                    self.current = self.current.parent

            def handle_data(self, data):
                self.current.append_text(data)

        _Parser(self).feed(markup)


__all__ = ["BeautifulSoup"]
