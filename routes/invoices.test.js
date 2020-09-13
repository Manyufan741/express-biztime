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

describe("GET /invoices", function () {
    test("Get all invoices", async function () {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body.invoices[0].comp_code).toEqual("apple");
        expect(res.body.invoices[0].amt).toEqual(100);
        expect(res.body.invoices[0].paid).toEqual(false);
        expect(res.body.invoices[0].paid_date).toEqual(null);
    })
});

describe("GET /invoices/id", function () {
    test("Get invoice by id", async function () {
        const result = await db.query(`SELECT id FROM invoices`);
        const id = result.rows[0].id;
        const res = await request(app).get(`/invoices/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice[0].comp_code).toEqual("apple");
        expect(res.body.invoice[0].amt).toEqual(100);
        expect(res.body.invoice[0].paid).toEqual(false);
        expect(res.body.invoice[0].paid_date).toEqual(null);
    })
    test("Error getting invoice by id", async function () {
        const res = await request(app).get('/invoices/0');
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /invoices", function () {
    test("Create a new invoice", async function () {
        const res = await request(app).post('/invoices').send({ comp_code: "apple", amt: 2013 });
        expect(res.statusCode).toBe(201);
        expect(res.body.comp_code).toEqual("apple");
        expect(res.body.amt).toEqual(2013);
        expect(res.body.paid).toEqual(false);
        expect(res.body.paid_date).toEqual(null);
    })

    test("Failed to create an invoice", async function () {
        const res = await request(app).post('/invoices').send({});
        expect(res.statusCode).toBe(400);
    })
});

describe("PATCH /invoices/:id", function () {
    test("Patch an invoice", async function () {
        const result = await db.query(`SELECT id FROM invoices`);
        const id = result.rows[0].id;
        const res = await request(app).patch(`/invoices/${id}`).send({ amt: 1314, paid: true });
        const date_ob = new Date();
        let day = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let now = year.toString() + '-0' + month.toString() + '-' + day.toString() + 'T07:00:00.000Z';
        expect(res.statusCode).toBe(200);
        expect(res.body.invoice.id).toEqual(id);
        expect(res.body.invoice.comp_code).toEqual("apple");
        expect(res.body.invoice.amt).toEqual(1314);
        expect(res.body.invoice.paid).toEqual(true);
        expect(res.body.invoice.paid_date).toEqual(now);
    })
    test("Failed to find an invoice to patch", async function () {
        const res = await request(app).patch('/invoices/0');
        expect(res.statusCode).toBe(404);
    })

    test("Failed to provide enough info for patching", async function () {
        const result = await db.query(`SELECT id FROM invoices`);
        const id = result.rows[0].id;
        const res = await request(app).patch(`/invoices/${id}`).send({ umm: "rew" });
        expect(res.statusCode).toBe(400);
    })
});

describe("DELETE /invoices/:id", function () {
    test("Delete an invoice", async function () {
        const result = await db.query(`SELECT id FROM invoices`);
        const id = result.rows[0].id;
        const res = await request(app).delete(`/invoices/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toEqual("deleted");
    })

    test("Failed to delete an invoice", async function () {
        const res = await request(app).delete('/invoices/0');
        expect(res.statusCode).toBe(404);
    })
});