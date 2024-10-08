import {
  Cache,
  GITHUB_FG_PAT,
  GITHUB_REPO,
  entries,
  isCacheValid,
  setCache,
} from "../../";
import { serialize } from "next-mdx-remote/serialize";

export const getDirFiles = async (path) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_FG_PAT}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get directory files: ${response}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Failed to fetch directory data: ${error}`);
  }
};

export const getFileFrontMatter = async (path) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_FG_PAT}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Network response failed");
    }
    const data = await response.json();

    const content = atob(data.content);
    const parsedMatter = await serialize(content, { parseFrontmatter: true });
    return parsedMatter;
  } catch (error) {
    console.error(`Error fetching CMS data at ${path}:`, error);
    throw new Error("Failed to fetch CMS data.");
  }
};

// export const getAllEntries = async (extension = "", refreshCache = false) => {
//   try {
//     if (!entries || refreshCache) {
//       const data = await getDirFiles("_entries");
//       setEntries(data);
//     }

//     let filteredEntries = entries;

//     if (extension) {
//       filteredEntries = entries.filter((file) => file.name.endsWith(`.${extension}.mdx`));
//     }

//     const entriesWithFrontMatter = await Promise.all(
//       filteredEntries.map(async (file) => {
//         const data = await getFileFrontMatter(`_entries/${file.name}`);
//         return { slug: file.name.split(".")[0], ...file, ...data };
//       })
//     );

//     return entriesWithFrontMatter;
//   } catch (error) {
//     console.error("Error fetching all entries:", JSON.stringify(error));
//     throw new Error("Failed to fetch all entries.");
//   }
// };

export async function getAllEntries(extension = "", refreshCache = false) {
  try {
    if (isCacheValid(Cache) && !refreshCache) {
      console.log("Returning cached _entries");
      let filteredEntries = Cache.data;

      if (extension) {
        filteredEntries = entries.filter((file) =>
          file.name.endsWith(`.${extension}.mdx`)
        );
      }

      return filteredEntries;
    }

    const data = await getDirFiles("_entries");

    let filteredEntries = data;

    if (extension) {
      filteredEntries = filteredEntries.filter((file) =>
        file.name.endsWith(`.${extension}.mdx`)
      );
    }

    const entriesWithFrontMatter = await Promise.all(
      filteredEntries.map(async (file) => {
        const data = await getFileFrontMatter(`_entries/${file.name}`);
        return { slug: file.name.split(".")[0], href_type: file.name.split(".")[1], ...file, data: data };
      })
    );

    setCache(entriesWithFrontMatter);
    return entriesWithFrontMatter;
  } catch (error) {
    console.error(JSON.stringify(error));
    throw new Error("Failed to fetch _entries");
  }
}

export async function collateCategories(extension = "") {
  const categorySet = new Set();
  const entries = await getAllEntries(extension);

  entries?.forEach((item) => {
    if (item.frontmatter && Array.isArray(item.frontmatter.categories)) {
      item.frontmatter.categories.forEach((category) => {
        const categoryKey = JSON.stringify(category);
        categorySet.add(categoryKey);
      });
    }
  });

  return Array.from(categorySet).map((categoryKey) =>
    JSON.parse(categoryKey as string)
  );
}

export async function getEntriesByCategory(category, extension = "") {
  const categoryEntries = {};
  const entries = await getAllEntries(extension);

  entries?.forEach((item) => {
    if (item.frontmatter && Array.isArray(item.frontmatter.categories)) {
      item.frontmatter.categories.forEach((category) => {
        const categoryKey = JSON.stringify(category);

        if (!categoryEntries[categoryKey]) {
          categoryEntries[categoryKey] = [];
        }

        categoryEntries[categoryKey].push(item);
      });
    }
  });

  const targetCategoryKey = JSON.stringify(category);
  return categoryEntries[targetCategoryKey] || [];
}

export const getEntry = async (fileName) => {
  try {
    const entry = await entries.find((ent) => ent.name === `${fileName}.mdx`);
    return entry;
  } catch (error) {
    console.error(`Error fetching entry ${fileName}:`, error);
    throw new Error(`Failed to fetch entry ${fileName}.`);
  }
};

export const updateEntry = async (fileName, newContent) => {
  try {
    // Get the current file data to get its SHA
    const fileDataResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/_entries/${fileName}.mdx`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GITHUB_FG_PAT}`,
        },
      }
    );

    if (!fileDataResponse.ok) {
      throw new Error(
        `Failed to fetch file data: ${fileDataResponse.statusText}`
      );
    }

    const fileData = await fileDataResponse.json();

    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/_entries/${fileName}.mdx`;
    const encodedContent = btoa(newContent);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_FG_PAT}`,
      },
      body: JSON.stringify({
        message: `Update ${fileName}.mdx`,
        content: encodedContent,
        sha: fileData.sha,
      }),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Error committing file:", errorDetails);
      throw new Error("Failed to update entry");
    }

    console.log("File updated successfully");
  } catch (error) {
    console.error(`Error updating entry ${fileName}:`, error);
    throw new Error(`Failed to update entry ${fileName}.`);
  }
};

export const commitEntry = async (path, fileContent, commitMessage) => {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
  const encodedContent = btoa(fileContent);

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_FG_PAT}`,
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodedContent,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    console.log("File committed successfully");
  } catch (error) {
    console.error("Error committing file:", error);
  }
};

export const createEntry = async (fileName, content) => {
  try {
    await commitEntry(
      `_entries/${fileName}.mdx`,
      content,
      `Create ${fileName}.mdx`
    );
  } catch (error) {
    console.error(`Error updating entry ${fileName}:`, error);
    throw new Error(`Failed to update entry ${fileName}.`);
  }
};

export const getFileHistory = async (fileName) => {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/commits?path=_entries/${fileName}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_FG_PAT}`,
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching file history for ${fileName}:`, error);
    throw new Error(`Failed to fetch file history for ${fileName}.`);
  }
};
