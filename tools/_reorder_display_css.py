# One-off: reorder display-related declarations in leaf CSS blocks. Run from repo root.
import re
from pathlib import Path

KEY_ORDER = ["display", "flex-direction", "justify-content", "align-items", "gap"]
PROP_RE = re.compile(
    r"^(\s*)(display|flex-direction|justify-content|align-items|gap)\s*:.+$"
)


def find_brace_pairs(text: str) -> list[tuple[int, int]]:
    stack: list[int] = []
    pairs: list[tuple[int, int]] = []
    for i, c in enumerate(text):
        if c == "{":
            stack.append(i)
        elif c == "}" and stack:
            open_i = stack.pop()
            pairs.append((open_i, i))
    return pairs


def process_inner(inner: str) -> str | None:
    if "display" not in inner:
        return None
    raw_lines = inner.split("\n")
    if not raw_lines:
        return None

    captured: dict[str, str] = {}
    special_indices: set[int] = set()

    for i, line in enumerate(raw_lines):
        m = PROP_RE.match(line)
        if not m:
            continue
        prop = m.group(2)
        captured[prop] = line
        special_indices.add(i)

    if "display" not in captured:
        return None

    first_special = min(special_indices)
    last_special = max(special_indices)

    need_blank_after_group = True
    for j in range(last_special + 1, len(raw_lines)):
        if j in special_indices:
            continue
        if not raw_lines[j].strip():
            need_blank_after_group = False
            break
        break

    non_special = [(i, line) for i, line in enumerate(raw_lines) if i not in special_indices]
    insert_at = sum(1 for i, _ in non_special if i < first_special)

    out: list[str] = []
    for idx, (_orig_i, line) in enumerate(non_special):
        if idx == insert_at:
            for k in KEY_ORDER:
                if k in captured:
                    out.append(captured[k])
            if need_blank_after_group:
                out.append("")
        out.append(line)

    if insert_at == len(non_special):
        for k in KEY_ORDER:
            if k in captured:
                out.append(captured[k])
        if need_blank_after_group:
            out.append("")

    while out and out[-1] == "" and len(out) >= 2 and out[-2] == "":
        out.pop()

    return "\n".join(out)


def main() -> None:
    path = Path(__file__).resolve().parent / "style.css"
    text = path.read_text(encoding="utf-8")
    pairs = find_brace_pairs(text)
    leaf_pairs: list[tuple[int, int, str]] = []
    for open_i, close_i in pairs:
        inner = text[open_i + 1 : close_i]
        if "{" in inner:
            continue
        if "display" not in inner:
            continue
        leaf_pairs.append((open_i, close_i, inner))

    new_text = text
    for open_i, close_i, inner in sorted(leaf_pairs, key=lambda x: x[0], reverse=True):
        new_inner = process_inner(inner)
        if new_inner is None or new_inner == inner:
            continue
        new_text = new_text[: open_i + 1] + new_inner + new_text[close_i:]

    path.write_text(new_text, encoding="utf-8")
    print(f"Updated {path} ({len(leaf_pairs)} leaf blocks checked)")


if __name__ == "__main__":
    main()
