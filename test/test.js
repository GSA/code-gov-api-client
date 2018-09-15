'use strict';
let expect = require('chai').expect;
let CodeGovAPIClient = require("../src/index.js").CodeGovAPIClient;
console.log("CodeGovAPIClient:", typeof CodeGovAPIClient);

let client = new CodeGovAPIClient({
  api_key: process.env.CODE_GOV_API_KEY,
  debug: true
});

describe('Getting Information', function() {

  describe('Searching', function() {
    it('should get suggestions for water', function(done) {
      this.timeout(50000);
      client.search("water").then(searchResults => {
        console.log("searchResults:", searchResults);
        const repos = searchResults.repos;
        expect(repos.length).to.be.above(2);
        expect(repos[0].name.toLowerCase()).to.have.string('water');
        done();
      });
    });

    it('should filter agencies properly by language', function(done) {
      this.timeout(50000);
      client.search("water", {languages: ['C']}).then(searchResults => {
        console.log("searchResults:", searchResults);
        const repos = searchResults.repos;
        expect(repos.length).to.be.above(0);
        expect(repos[0].name.toLowerCase()).to.have.string('water');
        done();
      });
    });

    it('should filter agencies properly by agency', function(done) {
      this.timeout(50000);
      const filters = {
        languages: ['C'],
        licenses: ['Creative Commons Zero (CC0)']
      };
      client.search("water", filters).then(searchResults => {
        console.log("searchResults:", searchResults);
        const repos = searchResults.repos;
        expect(repos.length).to.be.above(0);
        expect(repos[0].name.toLowerCase()).to.have.string('water');
        done();
      });
    });

  });
  describe('Autocompleting', function() {
    it('should get suggestions for National', function(done) {
        this.timeout(50000);
        client.suggest("National").then(searchResults => {
          console.log("searchResults:", searchResults);
          expect(searchResults.length).to.be.above(2);
          expect(searchResults[0].term.toLowerCase()).to.have.string('national');
          done();
        });
    });
  });

  describe("Getting Repositories for an Agency", function() {
    it("should get correct results", function(done) {
      this.timeout(50000);
      client.getAgencyRepos("USDA").then(data => {
        expect(data.repos.length).to.be.above(2);
        done();
      });
    });
  });

  describe("Getting Individual Repositories", function() {
    it("should get correct result", function(done) {
      this.timeout(50000);
      let repoId = "cfpb_new_clouseau_";
      client.getRepoById(repoId).then(repo => {
        console.log("repo", repo);
        done();
      });
    });
  });

  describe("Getting Agencies", function() {
    it("should get all the agencies", function(done) {
      this.timeout(50000);
      client.getAgencies(1000).then(agencies => {
        console.log("agencies:", agencies);
        expect(agencies.length).to.be.above(10);
        done();
      });
    });
  });
  
});
