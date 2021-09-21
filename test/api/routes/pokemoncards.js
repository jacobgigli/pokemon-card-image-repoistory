const expect = require("chai").expect;
const assert = require("chai").assert;
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../index.js");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTQ5NDgzYjNmNjRlNjQ5Y2YzMTJkNWYiLCJpYXQiOjE2MzIyNDM1NDJ9.P3MvXTYyv_XQ4D7wkZdTAW79I3CbEvC9alMQKHVyfUc";
const token2 =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTQ2NmMwMzE1YTNiOTc3MmIzNGZjYTMiLCJpYXQiOjE2MzIyNTA0NTR9.ahI-DTwnSPDAmTd0fFpHVeih6MAPpLDKoZZavR7Uu0o";

//Tests that use a item already created in the database for testing purposes
describe("Pokemon Card tests", () => {
  before(() =>
    mongoose.connect(
      "" + process.env.DB_CONNECT,
      { useNewUrlParser: true },
      () => console.log("connected to db")
    )
  );

  after(() => mongoose.disconnect());

  it("Returning an existing pokemon card by object id works successfully", (done) => {
    request(app)
      .get("/api/pokemoncards/614a20999475a5582ad2f99c")
      .set("auth-token", token)

      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property("_id");
        expect(body).to.contain.property("name");
        expect(body).to.contain.property("price");
        expect(body).to.contain.property("description");
        expect(body).to.contain.property("productImage");
        expect(body).to.contain.property("user");
        expect(body).to.contain.property("dateAcquired");
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Returning an existing pokemon card by name successfully", (done) => {
    request(app)
      .get("/api/pokemoncards/searchbyname/beedrill")
      .set("auth-token", token)

      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property("pokemonCards");
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Return message not found for pokemon card that does not exist", (done) => {
    request(app)
      .get("/api/pokemoncards/searchbyname/bee")
      .set("auth-token", token)

      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property("message");
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Search Pokemon cards by a field works correctly", (done) => {
    request(app)
      .get("/api/pokemoncards/sortbyfield/price")
      .set("auth-token", token)
      .send({ order: "1" })

      .then((res) => {
        const body = res.body;
        expect(body).to.contain.property("pokemonCards");
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Access deined when auth token is not provided", (done) => {
    request(app)
      .get("/api/pokemoncards/sortbyfield/price")
      .send({ order: "1" })

      .then((res) => {
        assert.deepEqual(res.status, 401);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Updating details of an existing users pokemon card", (done) => {
    request(app)
      .patch("/api/pokemoncards/614a21b602197d33ef3b33dc")
      .set("auth-token", token)
      .send({ description: "super rare card" })

      .then((res) => {
        const description = res.body.result.description;
        assert.deepEqual(description, "super rare card");
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Can not update a card that does not belong to the user", (done) => {
    request(app)
      .patch("/api/pokemoncards/614a21b602197d33ef3b33dc")
      .set("auth-token", token2)
      .send({ description: "super rare card" })

      .then((res) => {
        assert.deepEqual(res.status, 403);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  it("Can not update a card that does not exist", (done) => {
    request(app)
      .patch("/api/pokemoncards/614a21b602197d33ef3b3")
      .set("auth-token", token2)
      .send({ description: "super rare card" })

      .then((res) => {
        assert.deepEqual(res.status, 404);
        done();
      })
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });
});
