'use strict';
let expect = require('chai').expect;
let CodeGovAPIClient = require("../build/index.js").CodeGovAPIClient;
console.log("CodeGovAPIClient:", CodeGovAPIClient);

let client = new CodeGovAPIClient({
  environment: "local",
  debug: true
});

describe('Getting Information', function() {

  describe('Searching', function() {
    it('should get search results for National', function(done) {
        this.timeout(50000);
        client.search("National").then(search_results => {
          console.log("search_results:", search_results);
          expect(search_results.length).to.be.above(2);
          done();
        });
    });
  });

  describe("Getting Repositories for an Agency", function() {
    it("should get correct results", function(done) {
      this.timeout(50000);
      client.getAgencyRepos("USDA").then(repos => {
        //expect(repos.length).to.be.above(2);
        done();
      });
    });
  });

  describe("Getting Individual Repositories", function() {
    it("should get correct result", function(done) {
      this.timeout(50000);
      let repo_id = "nasa_dfrc_dthdata_armstrong_time_history_software_utility";
      client.getRepoByID(repo_id).then(repo => {
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
