const fetch = require('node-fetch')

function overlaps(array1, array2) {
  return array1.some(item => array2.includes(item))
}

class CodeGovAPIClient {
  constructor(options = {}) {
    console.log('constructing CodeGovAPIClient with this', this)

    this.base = options.base || 'https://api.code.gov/'
    this.debug = options.debug || false
    this.usageTypes = options.usageTypes || ['openSource', 'governmentWideReuse']

    if (options.api_key) {
      this.api_key = options.api_key
    }
    else {
      console.log('[code-gov-api-client] You did not specify an API Key.  You will not be able to access api.code.gov without a key.')
      this.api_key = null
    }

    ['base', 'debug', 'api_key'].forEach(key => {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    })
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
  getAgencies(size = 10) {
    return fetch(`${this.base}agencies?api_key=${this.api_key}&size=${size}`)
      .then(response => response.json())
      .then(data => data.agencies)
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
  getAgencyRepos(agencyId = '', size = 10) {
    const filters = { agencies: [agencyId], size }
    return this.repos(filters)
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
  getRepoById(repoId = '') {
    const url = `${this.base}repos/${repoId}`
    return fetch(url).then(response => response.json())
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
  suggest(term = '', size = 10) {
    if (term && term.length > 2) {
      let url = `${this.base}terms?term=${term}&size=${size}`
      if (this.api_key) url += `&api_key=${this.api_key}`
      if (this.debug) console.log('url:', url)
      return fetch(url)
        .then(response => response.json())
        .then(data => data.terms)
    }
    else {
      return Promise.resolve([])
    }
  }

  repos(params) {
    const { agencies, languages, licenses, q, size } = params
    const usageTypes = params.usageTypes || this.usageTypes

    let url = `${this.base}repos?size=${size}&api_key=${this.api_key}`

    if (q && q.length > 0) {
      url += `&q=${q}`
    }

    if (Array.isArray(agencies)) {
      agencies.forEach(agency => {
        url += `&agency.acronym=${agency}`
      })
    }

    if (Array.isArray(usageTypes)) {
      usageTypes.forEach(usageType => {
        url += `&permissions.usageType=${usageType}`
      })
    }

    if (Array.isArray(languages)) {
      languages.forEach(language => {
        url += `&languages=${language}`
      })
    }

    if (this.debug) console.log('fetching url:', url)

    return fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('data:', data)
        if (Array.isArray(licenses)) {
          data.repos = data.repos.filter(repo => {
            console.log('repo:', repo)
            if (repo.permissions) {
              if (Array.isArray(repo.permissions.licenses) && repo.permissions.licenses.length > 0) {
                const repoLicenses = repo.permissions.licenses
                console.log('repolicense:', repoLicenses)
                const licenseNames = repoLicenses.map(license => license.name)
                const licenseUrls = repoLicenses.map(license => license.URL)
                return overlaps(licenseNames, licenses) || overlaps(licenseUrls, licenses)
              }
              return false
            }
            return false
          })
        }
        return data
      })
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
  search(text = '', filters = {}, size = 100) {
    if (text && text.length > 0) {
      const params = { ...filters, q: text, size }
      return this.repos(params)
    }
    return Promise.resolve(null)
  }
}

module.exports = { CodeGovAPIClient }
