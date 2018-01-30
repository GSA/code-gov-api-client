# Alpha version
This code is still being developed.  It should not be used in production.

# code-gov-api-client
Client for Interacting with Code.gov API

# installation
```
npm install '@code.gov/code-gov-api-client';
```

# usage
```
import { CodeGovAPIClient } from "code-gov-api-client";

// initialize client
let client = new CodeGovAPIClient();

// get search results for "Space"
client.search("Space").then(search_results => {
  console.log("Agencies and repos related to space are ", search_results);
});

// get all agencies on code.government
client.getAgencies().then(agencies => {
  let count = agencies.length;
  console.log("There are " + count + " agencies on code.gov");
});

// get all repositories by an Agency
client.getAgencyRepos("SSA").then(repositories => {
  console.log("Social Security Agency has these repositories ", repositories);
});

// get information about a specific repository
let repo_id = "nasa_dfrc_dthdata_armstrong_time_history_software_utility";
client.getRepoByID(repo_id).then(repository => {
  console.log("Repository information is ", repository);
});
```
