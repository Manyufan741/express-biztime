process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
let db = require("../db");

beforeEach(async function () {
    await db.query(`INSERT INTO companies VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`);
    await db.query(`INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 100, false, null)`);
})

afterEach(async function () {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
})

afterAll(async function () {
    // close db connection
    await db.end();
});

describe("GET /companies", function () {
    test("Get all companies", async function () {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body.companies[0].code).toEqual("apple");
    })
});

describe("GET /companies/code", function () {
    test("Get company by code", async function () {
        const res = await request(app).get('/companies/apple');
        expect(res.statusCode).toBe(200);
        expect(res.body.company[0].code).toEqual("apple");
        expect(res.body.company[0].name).toEqual("Apple Computer");
        expect(res.body.company[0].description).toEqual("Maker of OSX.");
    })
    test("Error getting company by code", async function () {
        const res = await request(app).get('/companies/lol');
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /companies", function () {
    test("Create a new company", async function () {
        const res = await request(app).post('/companies').send({ code: "TSLA", name: "Tesla", description: "EV maker." });
        expect(res.statusCode).toBe(201);
        expect(res.body.code).toEqual("TSLA");
        expect(res.body.name).toEqual("Tesla");
        expect(res.body.description).toEqual("EV maker.");
    })

    test("Failed to create a company", async function () {
        const res = await request(app).post('/companies').send({});
        expect(res.statusCode).toBe(400);
    })
});

describe("PATCH /companies/:code", function () {
    test("Patch a company", async function () {
        const res = await request(app).patch('/companies/apple').send({ name: "AAA", description: "Good" });
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toEqual("AAA");
        expect(res.body.description).toEqual("Good");
    })

    test("Failed to find an the company to patch", async function () {
        const res = await request(app).patch('/companies/pineapple');
        expect(res.statusCode).toBe(400);
    })

    test("Failed to provide enough info for patching", async function () {
        const res = await request(app).patch('/companies/apple').send({ umm: "rew" });
        expect(res.statusCode).toBe(400);
    })
});

describe("DELETE /companies/:code", function () {
    test("Delete a company", async function () {
        const res = await request(app).delete('/companies/apple');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toEqual("deleted");
    })

    test("Failed to delete a company", async function () {
        const res = await request(app).delete('/companies/jibberish');
        expect(res.statusCode).toBe(404);
    })
});
