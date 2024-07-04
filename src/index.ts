import { getAllEntries, getEntry, updateEntry } from "./lib/provider/github";
import chalker, { logIndicator, logLabel } from "./utils/chalker";

interface initConfig {
  credentials: {
    token: string;
    repo: string;
  };
  cache: boolean;
  refreshCacheInterval: number;
}

export let GITHUB_FG_PAT: string | null = null;
export let GITHUB_REPO: string | null = null;

const setConfig = (options: Partial<initConfig>): initConfig => {
  const mergedConfig = {
    ...defaultConfig,
    ...options,
    credentials: {
      ...defaultConfig.credentials,
      ...options.credentials,
    },
  };

  if (!mergedConfig.credentials.token || !mergedConfig.credentials.repo) {
    throw new Error("Both token and repo are required in the configuration.");
  }

  // Validate repo format
  const repoPattern = /^[^\/]+\/[^\/]+$/;
  if (!repoPattern.test(mergedConfig.credentials.repo)) {
    throw new Error(
      "Invalid repo format. Expected format is 'org/repo' or 'user/repo'."
    );
  }

  GITHUB_FG_PAT = mergedConfig.credentials.token;
  GITHUB_REPO = mergedConfig.credentials.repo;

  return mergedConfig;
};

export let entries: any = null;
export let initialised: boolean = false;


const defaultConfig: initConfig = {
  credentials: {
    token: "default-token",
    repo: "default-repo",
  },
  cache: true,
  refreshCacheInterval: 24 * 60 * 60 * 1000,
};

export const setEntries = (data: any) => {
  entries = data;
};

export const setInit = (bool: boolean) => {
  initialised = bool;
};


const init = async (options: Partial<initConfig> = {}) => {
  if (!initialised) {
    // Step 1: Set Configurations
    console.log(logLabel, logIndicator, chalker.fgGreen("↺ Initialising..."));
    setConfig(options);
    console.log(
      logLabel,
      logIndicator,
      chalker.fgGreen(`↺ Configured repository: "${GITHUB_REPO}"`)
    );

    // Step 2: Cache _entries
    console.log(
      logLabel,
      logIndicator,
      chalker.fgGreen(`↺ Fetching gitmdx "_entries" folder...`)
    );

    entries = await getAllEntries();

    console.log(
      logLabel,
      logIndicator,
      chalker.fgYellow(`✨ cached "_entries" folder ...`)
    );

    // Step 3: Set initialisation = true
    setInit(true);
    console.log(
      logLabel,
      logIndicator,
      chalker.fgYellow(`✨ gitmdx initialised...`)
    );
  }

};

export default { entries, getAllEntries, getEntry, updateEntry, init };
