import { FileItem } from "@/store/use-app-store";

/**
 * Recursively reads a FileSystemDirectoryHandle and converts it into a FileItem tree.
 * Filters out heavy directories and attaches handles to each node for direct browser access.
 * Supported in Chromium browsers (Chrome, Edge, Opera, Brave).
 */
export async function readDirectoryRecursive(
  dirHandle: any, // FileSystemDirectoryHandle
  parentPath: string = ""
): Promise<FileItem[]> {
  const IGNORE_LIST = ['.git', 'node_modules', '.next', 'build', '.gguf', 'out', '.cache', '.DS_Store'];
  const items: FileItem[] = [];

  try {
    for await (const entry of dirHandle.values()) {
      if (IGNORE_LIST.includes(entry.name)) continue;

      const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      const item: FileItem = {
        name: entry.name,
        path: fullPath,
        is_dir: entry.kind === 'directory',
        handle: entry,
      };

      if (entry.kind === 'directory') {
        item.children = await readDirectoryRecursive(entry, fullPath);
      }

      items.push(item);
    }
  } catch (err) {
    console.error(`Error reading directory ${dirHandle.name}:`, err);
  }

  return items.sort((a, b) => {
    if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Universal directory parser for all browsers (Firefox, Safari, Chrome, Edge, Mobile).
 * Converts standard HTML5 FileList from <input type="file" webkitdirectory directory multiple>
 * into a hierarchical FileItem tree with file handles attached for zero-egress reading.
 */
export function buildTreeFromFileList(files: FileList | File[]): { rootName: string; tree: FileItem[] } {
  const IGNORE_LIST = ['.git', 'node_modules', '.next', 'build', '.gguf', 'out', '.cache', '.DS_Store'];
  const rootMap = new Map<string, any>();
  let rootName = "workspace";

  const fileArray = Array.from(files);
  for (const file of fileArray) {
    const relPath = file.webkitRelativePath || file.name;
    const parts = relPath.split(/[\/\\]/);

    if (parts.length > 1) {
      rootName = parts[0];
    }

    // Ignore heavy directories or system artifacts
    if (parts.some((p) => IGNORE_LIST.includes(p))) continue;

    // Use relative path under the root directory
    const pathParts = parts.length > 1 ? parts.slice(1) : parts;
    let currentMap = rootMap;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isFile = i === pathParts.length - 1;
      const fullPath = parts.slice(0, (parts.length > 1 ? 1 : 0) + i + 1).join('/');

      if (isFile) {
        currentMap.set(part, {
          name: part,
          path: fullPath,
          is_dir: false,
          handle: file, // Standard HTML5 File object with .text()
        });
      } else {
        if (!currentMap.has(part)) {
          currentMap.set(part, {
            name: part,
            path: fullPath,
            is_dir: true,
            childrenMap: new Map(),
          });
        }
        currentMap = currentMap.get(part).childrenMap;
      }
    }
  }

  function convertMapToTree(map: Map<string, any>): FileItem[] {
    const items: FileItem[] = [];
    for (const [_, val] of map.entries()) {
      if (val.is_dir) {
        items.push({
          name: val.name,
          path: val.path,
          is_dir: true,
          children: convertMapToTree(val.childrenMap),
        });
      } else {
        items.push({
          name: val.name,
          path: val.path,
          is_dir: false,
          handle: val.handle,
        });
      }
    }
    return items.sort((a, b) => {
      if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return {
    rootName,
    tree: convertMapToTree(rootMap),
  };
}
