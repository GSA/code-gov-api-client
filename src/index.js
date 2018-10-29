const fetch = require('node-fetch')
const { includes, lower, overlaps, some, trim } = require('@code.gov/cautious')

class CodeGovAPIClient {
  constructor(options = {}) {
    console.log('constructing CodeGovAPIClient with this', this)

    this.base = options.base || 'https://api.code.gov/'
    this.remember = options.remember || false
    this.debug = options.debug || false
    this.tasksUrl = options.tasksUrl || 'https://raw.githubusercontent.com/GSA/code-gov-data/master/help-wanted.json'
    this.cache = {}
    this.usageTypes = options.usageTypes || ['openSource', 'governmentWideReuse']

    if (options.api_key) {
      this.api_key = options.api_key
    }
    else {
      console.log('[code-gov-api-client] You did not specify an API Key.  You will not be able to access api.code.gov without a key.  Get one at https://developers.code.gov/key.html.')
      this.api_key = null
    }

    ['base', 'debug', 'api_key'].forEach(key => {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    })
  }

  /**
   * This function gets agencies on code.gov, sorted by name
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
      .then(agencies => agencies.sort((a, b) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      }))
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
    let url = `${this.base}repos/${repoId}`
    if (this.api_key) url += `?api_key=${this.api_key}`
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
    const { agencies, from, languages, licenses, q, sort, size } = params
    const usageTypes = params.usageTypes || this.usageTypes

    let url = `${this.base}repos?size=${size}&api_key=${this.api_key}`

    if (from && from.length > 0) {
      url += `&from=${from}`
    }

    if (q && q.length > 0) {
      url += `&q=${q}`
    }

    if (some(agencies)) {
      agencies.forEach(agency => {
        url += `&agency.acronym=${agency}`
      })
    }

    if (some(usageTypes)) {
      usageTypes.forEach(usageType => {
        url += `&permissions.usageType=${usageType}`
      })
    }

    if (some(languages)) {
      languages.forEach(language => {
        url += `&languages=${language}`
      })
    }

    /*
    will uncomment once api supports licenses
    if (some(licenses)) {
      licenses.forEach(license => {
        url += `&licenses.name=${license}`
      })
    }
    */

    if (sort) {
      const sortNormalized = sort.toLowerCase().trim()
      if (sortNormalized === 'a-z' || sortNormalized === 'name__asc') {
        url += `&sort=name__asc`
      }
    }

    if (this.debug) console.log('fetching url:', url)

    return fetch(url).then(response => response.json())
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


  tasks(params) {
    let { agencies, from, languages, skillLevels, size, timeRequired } = params || {}

    // clean and normalize
    agencies = trim(lower(agencies))
    from = Number(size || 0)
    languages = trim(lower(languages))
    size = Number(size || 10)
    skillLevels = trim(lower(skillLevels))
    timeRequired = trim(lower(timeRequired))

    const key = JSON.stringify({ agencies, languages, size, skillLevels, timeRequired })

    if (this.cache.hasOwnProperty(key)) {
      return Promise.resolve(this.cache[key])
    } else {
      return fetch(this.tasksUrl)
        .then(response => response.json()).then(data => {
          const result = {
            tasks: []
          }
          const items = data.items
          const count = items.length
          for (let i = 0; i < count; i++) {
            const task = items[i]
            const effort = trim(lower(task.effort))
            const skill = trim(lower(task.skill))

            if(some(agencies) && !includes(agencies, task.agency.name)) {
              return
            }

            if(some(languages) && !overlaps(languages, task.languages)) {
              return
            }

            if(some(skillLevels) && !includes(skillLevels, skill)) {
              return
            }

            if(some(timeRequired) && !includes(timeRequired, effort)) {
              return
            }

            result.tasks.push(task)

          }
          result.total = result.tasks.length
          result.tasks = result.tasks.slice(from, from + size)
          return result
        })
    }
  }
}

module.exports = { CodeGovAPIClient }
