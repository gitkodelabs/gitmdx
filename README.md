# Gitmdx
An open-source headless CMS (Content Management System) based on Git.


## Installation
Instructions on how to install your library.

1. Install package:

```bash
npm i @kode/gitmdx
```

## Usage

2. Import the library:

```js
// Import the library
import gitmdx from "@kode/gitmdx"

```

### Examples 

**Remix:**
```JS
// app/root.tsx

... other imports 

import gitmdx from "@kode/gitmdx"

// Initiate CMS -- Initiate in root to be able to access cache from anywhere
// Cache decreases the amount of API requests sent through Github API
// Using a personal access token allows for a higher rate limit compared to public repositories

export async function loader({ request }: LoaderFunctionArgs) {

  gitmdx.init({
    credentials: {
      token: "github_pat_...",
      repo: "owner/repo",
    }
  });

  return {}
};

```

```js
// app/routes/$slug.tsx

export async function loader({ params, request }: LoaderFunctionArgs) {

  const page = await gitmdx.getEntry(`${params.slug}.page`);

  if (!page) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return json({ page  });
};

```