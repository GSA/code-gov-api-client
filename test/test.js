'use strict';
let expect = require('chai').expect;
let CodeGovAPIClient = require("../build/index.js").CodeGovAPIClient;
console.log("CodeGovAPIClient:", CodeGovAPIClient);

let client = new CodeGovAPIClient();

describe('Getting Information', function() {
  describe('Searching', function() {
    it('should get search results for National', function(done) {
        this.timeout(50000);
        client.search("National").then(search_results => {
          console.log("search_results:", search_results);
          expect(search_results.length).to.be.above(10);
          done();
        });
    });
  });

  describe("Getting Repositories for an Agency", function() {
    it("should get correct results", function(done) {
      this.timeout(50000);
      client.getAgencyRepos("USDA").then(repos => {
        expect(repos.length).to.be.above(10);
        done();
      });
    });
  });

});
