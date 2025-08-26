import { invoke } from "@tauri-apps/api/core";
import { useSetting } from "./useSettings";
import { open} from "@tauri-apps/plugin-dialog";
import { getLibraryName } from "../lib/utils";

export function useLibrary() {
  const [rootDir, setRootDir] = useSetting("rootDir", "");
  const [libraryHistory, setLibraryHistory, updateLibraryHistory] = useSetting(
    "libraryHistory",
    []
  );

  const handleLibrarySelect = async (path: string) => {
    // Check if the path is different to avoid unnecesary writes
    if (path !== rootDir) {
      await setRootDir(path);

      // Add selected path to the top of the history
      if (updateLibraryHistory) {
        await updateLibraryHistory((currentHistory) => {
          const filteredHistory = currentHistory.filter((p) => p !== path);
          return [path, ...filteredHistory];
        });
      }
    }
  };

  const createNewLibrary = async () => {
    // TODO: Use a custom dialog from frontend
    const libraryName = prompt("Please enter a name for your new library:");

    if (!libraryName) return;

    // Open a native directory dialog
    const selectedDirectory = await open({
      directory: true,
      multiple: false,
    });

    // Check if the user selected a directory
    if (selectedDirectory) {
      const newLibraryPath = `${selectedDirectory}/${libraryName}.library`;

      try {
        await invoke("create_library", { libraryPath: newLibraryPath });

        await handleLibrarySelect(newLibraryPath);

        /*  await setRootDir(newLibraryPath);
        if (updateLibraryHistory) {
          await updateLibraryHistory((currentHistory) => {
            // Ensure no duplicates and place the new path at the top
            const filteredHistory = currentHistory.filter(
              (p) => p !== newLibraryPath
            );
            return [newLibraryPath, ...filteredHistory];
          });
        } */
      } catch (e) {
        console.error("Failed to create a new library", e);
      }
    }
  };

 /*  const removeLibrary = async (pathToRemove: string) => {
    if (libraryHistory && updateLibraryHistory) {
      // Use the update function to remove the path
      if (updateLibraryHistory) {
        await updateLibraryHistory((currentHistory) => {
          return currentHistory.filter((p) => p !== pathToRemove);
        });
      }

      // If the current rootDir is the one being removed, set it to the first in the new history
      if (rootDir === pathToRemove) {
        const newHistory = libraryHistory.filter((p) => p !== pathToRemove);
        await setRootDir(newHistory[0] || "");
      }
    }
  }; */

 
  const removeLibrary = async (pathToRemove: string) => {
    if (libraryHistory) {
      const newHistory = libraryHistory.filter((p) => p !== pathToRemove);
      await setLibraryHistory(newHistory);

      if (rootDir === pathToRemove) {
        await setRootDir(newHistory[0] || "");
      }
    }
  };

  const currentLibraryName = getLibraryName(rootDir);

  return {
    //UI Friendly
    rootDir,
    libraryHistory,
    currentLibraryName,
    // Logic 
    handleLibrarySelect,
    createNewLibrary,
    removeLibrary
  }
}