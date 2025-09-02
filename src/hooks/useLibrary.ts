import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open } from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "@/lib/utils";
import {
  connect,
  ImageRecord,
  insertFolders,
  insertImages,
  linkImagesToFolders,
} from "@/lib/db";
import { FolderImportData, ImportResult } from "@/types";

export function useLibrary() {
  const [rootDir, setRootDir] = useSetting("rootDir", "");
  const [history, setHistory, updateHistory] = useSetting("libraryHistory", []);

  const selectLibrary = async (path: string) => {
    if (path === rootDir) return;

    await setRootDir(path);
    if (updateHistory) {
      await updateHistory((prev) => {
        const history = prev as string[];
        return [path, ...history.filter((p) => p !== path)];
      });
    }
  };

  const createNewLibrary = async () => {
    // TODO: use custom dialog in frontend
    const name = prompt("Library name:");
    if (!name) return;

    const dir = await open({ directory: true, multiple: false });
    if (!dir) return;

    const path = `${dir}\\${name}.library`;

    try {
      const dbPath = await invoke<string>("create_library", {
        libraryPath: path,
      });

      await connect(dbPath);
      await invoke("run_migrations", { dbPath });
      await selectLibrary(path);
    } catch (e) {
      console.error("Error creating library:", e);
    }
  };

  const removeLibrary = async (toRemove: string) => {
    if (updateHistory) {
      await updateHistory((prev: string[]) => {
        const next = prev.filter((p) => p !== toRemove);
        if (rootDir === toRemove) {
          setRootDir(next[0] ?? "");
        }
        return next;
      });
    }
  };

  const importImages = async () => {
    if (!rootDir) {
      console.warn("No active library selected.");
      return;
    }

    const srcDir = await open({ directory: true, multiple: false });

    if (!srcDir) return;

    try {
      const { folders, images, pathLinks } = await invoke<ImportResult>(
        "import_images",
        { sourceDir: srcDir, destDir: rootDir }
      );

      const dbPath = `${rootDir}/library.db`;
      await insertFolders(dbPath, folders);
      await insertImages(dbPath, images);

      const links = images
        .map((img) => ({
          folder_id: pathLinks[img.parentDirPath],
          image_id: pathLinks[img.sourcePath],
        }))
        .filter((l) => l.folder_id && l.image_id);

      await linkImagesToFolders(dbPath, links);
    } catch (e) {
      console.error("Failed to import images:", e);
    }
  };

  return {
    //UI Friendly
    rootDir,
    history,
    currentLibraryName: getLibraryName(rootDir),
    // Logic
    importImages,
    selectLibrary,
    createNewLibrary,
    removeLibrary,
  };
}
