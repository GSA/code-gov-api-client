'use strict';
let expect = require('chai').expect;
let CodeGovAPIClient = require("../src/index.js").CodeGovAPIClient;

let client = new CodeGovAPIClient({
  api_key: process.env.CODE_GOV_API_KEY,
  base: process.env.CODE_GOV_API_BASE,
  debug: false
});

describe('Getting Information', function() {

  describe('Browsing', function() {
    it('should get initial repos', function(done) {
      this.timeout(3000)
      const filters = {
        agencies: [],
        languages: [],
        licenses: [],
        size: 10,
        usageTypes: []
      }
      client.repos(filters).then(results => {
        const repos = results.repos || results.data;
        expect(repos.length).to.equal(10);
        done();
      })
    })
  })

  describe('Searching', function() {
    it('should get repos about water', function(done) {
      this.timeout(3000);
      client.search("water").then(searchResults => {
        const repos = searchResults.repos;
        expect(repos.length).to.be.above(2);
        expect(repos[0].description.toLowerCase()).to.have.string('water');
        done();
      });
    });

    it('should filter agencies properly by language', function(done) {
      this.timeout(3000);
      client.search("water", {languages: ['C']}).then(searchResults => {
        const repos = searchResults.repos || searchResults.data;
        const languages = repos.map(repo => repo.languages[0])
        expect(repos.length).to.be.above(0);
        expect(repos[0].name.toLowerCase()).to.have.string('water');
        done();
      });
    });

    it('should filter agencies properly by agency', function(done) {
      this.timeout(3000);
      const filters = {
        languages: ['C'],
        licenses: ['Creative Commons Zero (CC0)']
      };
      client.search("water", filters).then(searchResults => {
        const repos = searchResults.repos;
        expect(repos.length).to.be.above(0);
        expect(repos[0].name.toLowerCase()).to.have.string('water');
        done();
      });
    });

  });
  describe('Autocompleting', function() {
    it('should get suggestions for National', function(done) {
        this.timeout(3000);
        client.suggest("National").then(searchResults => {
          expect(searchResults.length).to.be.above(2);
          expect(searchResults[0].toLowerCase()).to.have.string('national');
          done();
        });
    });
  });

  describe("Getting Repositories for an Agency", function() {
    it("should get correct results", function(done) {
      this.timeout(3000);
      client.getAgencyRepos("USDA").then(data => {
        expect(data.repos.length).to.be.above(2);
        done();
      });
    });
  });

  describe("Getting Individual Repositories", function() {
    it("should get correct result", function(done) {
      this.timeout(3000);
      let repoID = "doe_sandia_national_laboratories_snl_water_network_tool_for_resilience_v_1_0";
      client.getRepoById(repoID).then(repo => {
        expect(repo.repoID).to.equal(repoID)
        done();
      });
    });
  });

  describe("Getting Agencies", function() {
    it("should get all the agencies", function(done) {
      this.timeout(3000);
      client.getAgencies(1000).then(agencies => {
        expect(agencies.length).to.be.above(10);
        done();
      });
    });
  });

});
