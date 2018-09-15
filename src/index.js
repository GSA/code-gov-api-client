import fetch from 'node-fetch';

export default class CodeGovAPIClient {

  constructor (options={}){
    console.log('constructing CodeGovAPIClient');
    
    this.base = options.base || 'https://api.code.gov/';
    this.debug = options.debug || false;
    this.key = options.key || null;
    
    ['base', 'debug', 'key'].forEach(key => {
      if (options.has(key)) {
        this[key] = options[key];
      }
    });
  }

  /**
  * This function gets all the agencies on code.gov
  * @name getAgencies
  * @returns {Object} array of agencies
  * @example
  * client.getAgencies().then(agencies => {
  *   let count = agencies.length;
  *   console.log("There are " + count + " agencies on code.gov");
  * });
  */
  getAgencies () {
    return fetch(`${this.base}agencies`)
      .then(response => response.json())
      .then(data => data.agencies);
  }

  /**
  * This function gets all the repositories
  * by a specified agency that are licensed under
  * open-source or government wide reuse.
  * It is used to explore on code.gov.
  * @name getAgencyRepos
  * @param {string} agencyId - the agency acronymn
  * @param {number} [size=10] - the number of search results to return
  * @returns {Object} array of repositories
  * @example
  * client.getAgencyRepos("SSA").then(repositories => {
  *   console.log("Social Security Agency has these repositories ", repositories);
  * });
  */
  getAgencyRepos (agencyId='', size=10){
    /*
      - permissions.usageType is "openSource" or "governmentWideReuse"
    */
    const url = `${this.base}repos?agency.acronym=${agencyId}&size=${size}&sort=name__asc`;
    if (this.DEBUG) console.log('getAgencyRepos: url:', url);
    return fetch(url)
      .then(response => response.json())
      .then(data => data.repos);
  }

  /**
  * This function gets a repository by its id
  * It is used on the project details page of code.gov.
  * @name getRepoById
  * @param {string} repoId - the agency acronymn
  * @returns {Object} repository - object that holds information about repo
  * @example
  * let repoId = "nasa_dfrc_dthdata_armstrong_time_history_software_utility";
  * client.getRepoByID(repoId).then(repository => {
  *   console.log("Repository information is ", repository);
  * });
  */
  getRepoById (repoId='') {
    const url = `${this.base}repos/${repoId}`;
    return fetch(url).then(response => response.json());
  }

  /**
   * The suggest function takes in a search term then
   * returns auto-complete / type-ahead suggestions.
   * It is used by the search boxes on code.gov.
   * @function
   * @name suggest
   * @param {string} term - the term to search by
   * @param {number} [size=10] - the number of search results to return
   * @returns {Object} array of search result objects
   * @example
   * client.suggest("space").then(terms => {
   *   console.log("Terms that are related to space", terms);
   * });
   */
  suggest (term='', size=10) {
    if (term && term.length > 2) {
      const url = `${this.base}terms?_fulltext=${term}&size=${size}`;
      return fetch(url)
        .then(response => response.json())
        .then(data => data.terms);
    } else {
      return Promise.resolve([]);
    }
  }

  /**
   * This function searches all of the repositories
   * based on a string of text.
   * @function
   * @name search
   * @param {string} text - the text to search by
   * @returns {Object} array of search result repos
   * client.search("services").then(repos => {
   *   console.log("Repos related to services are", repos);
   * });
   */
  search (text='', size=10) {
    if (text && text.length > 0) {
      const url = `{this.base}repos?q=${text}&size=${size}`;
      if (this.DEBUG) console.log('search:', url);
      return fetch(url).then(response => response.json());
    }
  }

}
