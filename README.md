# code-gov-api-client
Client for Interacting with Code.gov API

# installation
```
npm install code-gov-api-client;
```

# usage
```
import { CodeGovAPIClient } from "code-gov-api-client";

// initialize client
let client = new CodeGovAPIClient();

// get search results for "Space"
let results = client.search("Space");

// get all repositories by an Agency
let repos = client.getAgencyRepos("SSA");

// get information about a specific repository
let repo = client.getRepoByID("nasa_dfrc_dthdata_armstrong_time_history_software_utility");
```
