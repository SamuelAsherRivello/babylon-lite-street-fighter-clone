"""Extract isolated runtime poses from generated 4-by-2 fighter source atlases.

Requires Pillow and NumPy. Run from the repository root:
  python street-fighter-ii/scripts/extract-fighter-poses.py
"""

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / "documentation" / "art"
SOURCES = {
    "ryu": ART / "source-atlases" / "ryu-source.png",
    "chunLi": ART / "source-atlases" / "chun-li-source.png",
    "kaida": ART / "source-atlases" / "kaida-source.png",
}
POSES = ("idle", "walk", "crouch", "jump", "punch", "kick", "hit", "block")
FRAME_SIZE = 512
FRAME_PADDING = 8
GROUND_BASELINE = FRAME_SIZE - FRAME_PADDING
MAX_POSE_HEIGHT = FRAME_SIZE - 2 * FRAME_PADDING
MAX_POSE_WIDTH = FRAME_SIZE - 2 * FRAME_PADDING
MIN_COMPONENT_PIXELS = 20_000


def connected_components(alpha):
    """Label 8-connected alpha pixels using row runs; return masks and bounds."""
    height, width = alpha.shape
    parents = [0]
    runs_by_row = []
    previous = []

    def find(label):
        while parents[label] != label:
            parents[label] = parents[parents[label]]
            label = parents[label]
        return label

    for y in range(height):
        edges = np.flatnonzero(np.diff(np.r_[False, alpha[y], False].astype(np.int8)))
        current = []
        for x0, edge_after in zip(edges[::2], edges[1::2]):
            x1 = int(edge_after) - 1
            labels = list(dict.fromkeys(find(label) for left, right, label in previous if x0 <= right + 1 and x1 >= left - 1))
            if labels:
                label = labels[0]
                for other in labels[1:]:
                    if other != label:
                        parents[other] = label
            else:
                label = len(parents)
                parents.append(label)
            current.append((int(x0), x1, label))
        runs_by_row.append(current)
        previous = current

    components = {}
    for y, row in enumerate(runs_by_row):
        for x0, x1, label in row:
            label = find(label)
            count = x1 - x0 + 1
            stats = components.setdefault(label, {"pixels": 0, "left": width, "top": height, "right": -1, "bottom": -1, "sum_x": 0.0, "sum_y": 0.0})
            stats["pixels"] += count
            stats["left"] = min(stats["left"], x0)
            stats["top"] = min(stats["top"], y)
            stats["right"] = max(stats["right"], x1 + 1)
            stats["bottom"] = max(stats["bottom"], y + 1)
            stats["sum_x"] += (x0 + x1) * count / 2
            stats["sum_y"] += y * count

    for label, stats in components.items():
        stats["label"] = label
        stats["center_x"] = stats["sum_x"] / stats["pixels"]
        stats["center_y"] = stats["sum_y"] / stats["pixels"]

    for y, row in enumerate(runs_by_row):
        runs_by_row[y] = [(x0, x1, find(label)) for x0, x1, label in row]
    return runs_by_row, list(components.values())


def assign_poses(components, width, height):
    frame_centers = [((column + 0.5) * width / 4, (row + 0.5) * height / 2, row * 4 + column) for row in range(2) for column in range(4)]
    candidates = [part for part in components if part["pixels"] >= MIN_COMPONENT_PIXELS]
    pairs = []
    for center_x, center_y, pose_index in frame_centers:
        for part in candidates:
            dx = (part["center_x"] - center_x) / (width / 4)
            dy = (part["center_y"] - center_y) / (height / 2)
            pairs.append((dx * dx + dy * dy, pose_index, part))

    assignments = {}
    used = set()
    for _, pose_index, part in sorted(pairs, key=lambda pair: pair[0]):
        if pose_index not in assignments and part["label"] not in used:
            assignments[pose_index] = part
            used.add(part["label"])
    if len(assignments) != 8:
        raise RuntimeError(f"Expected eight complete fighter silhouettes; found {len(assignments)}")
    return assignments


def extract_component(source, source_alpha, runs_by_row, label, bounds):
    left, top, right, bottom = (bounds["left"], bounds["top"], bounds["right"], bounds["bottom"])
    pixels = np.asarray(source.crop((left, top, right, bottom))).copy()
    pixels[:, :, 3] = 0
    for y in range(top, bottom):
        for x0, x1, run_label in runs_by_row[y]:
            if run_label == label:
                pixels[y - top, x0 - left:x1 + 1 - left, 3] = source_alpha[y, x0:x1 + 1]
    return Image.fromarray(pixels, "RGBA")


def main():
    output_dir = ART / "fighter-poses"
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"frameSize": FRAME_SIZE, "groundBaselineY": GROUND_BASELINE, "poses": list(POSES), "fighters": {}}
    previews = {}

    for fighter_id, source_path in SOURCES.items():
        if not source_path.is_file():
            raise FileNotFoundError(source_path)
        source = Image.open(source_path).convert("RGBA")
        width, height = source.size
        if width < 4 or height < 2:
            raise ValueError(f"Invalid source atlas: {source_path}")

        source_alpha = np.asarray(source.getchannel("A"))
        runs_by_row, components = connected_components(source_alpha > 0)
        assignments = assign_poses(components, width, height)
        max_width = max(part["right"] - part["left"] for part in assignments.values())
        max_height = max(part["bottom"] - part["top"] for part in assignments.values())
        scale = min(MAX_POSE_WIDTH / max_width, MAX_POSE_HEIGHT / max_height)
        manifest["fighters"][fighter_id] = {}
        previews[fighter_id] = []

        for index, pose in enumerate(POSES):
            part = assignments[index]
            silhouette = extract_component(source, source_alpha, runs_by_row, part["label"], part)
            size = (max(1, round(silhouette.width * scale)), max(1, round(silhouette.height * scale)))
            silhouette = silhouette.resize(size, Image.Resampling.NEAREST)
            frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
            left = (FRAME_SIZE - size[0]) // 2
            top = GROUND_BASELINE - size[1]
            frame.alpha_composite(silhouette, (left, top))

            filename = f"{fighter_id}-{pose}.png"
            frame.save(output_dir / filename, optimize=True)
            manifest["fighters"][fighter_id][pose] = f"fighter-poses/{filename}"
            previews[fighter_id].append(frame)

            bounds = frame.getchannel("A").getbbox()
            if not bounds or bounds[0] < FRAME_PADDING or bounds[1] < FRAME_PADDING or bounds[2] > FRAME_SIZE - FRAME_PADDING or bounds[3] != GROUND_BASELINE:
                raise RuntimeError(f"Unexpected output bounds for {fighter_id} {pose}: {bounds}")

    (ART / "fighter-pose-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    tile_width, tile_height, label_height = 128, 128, 24
    preview = Image.new("RGBA", (tile_width * len(POSES), (tile_height + label_height) * len(SOURCES)), (40, 31, 43, 255))
    draw = ImageDraw.Draw(preview)
    font = ImageFont.load_default()
    for row, (fighter_id, frames) in enumerate(previews.items()):
        for column, (pose, frame) in enumerate(zip(POSES, frames)):
            tile = Image.new("RGBA", (tile_width, tile_height), (49, 39, 52, 255))
            sprite = frame.resize((tile_width, tile_height), Image.Resampling.NEAREST)
            tile.alpha_composite(sprite)
            x, y = column * tile_width, row * (tile_height + label_height)
            preview.alpha_composite(tile, (x, y))
            draw.text((x + 3, y + tile_height + 4), f"{fighter_id} / {pose}", font=font, fill=(255, 236, 196, 255))
    preview.save(ART / "fighter-poses-preview.png", optimize=True)
    print(f"Extracted {sum(len(poses) for poses in manifest['fighters'].values())} poses to {output_dir}")


if __name__ == "__main__":
    main()
