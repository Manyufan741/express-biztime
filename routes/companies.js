const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

async function find(code) {
    const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [code]);
    if (results.rows.length === 0) {
        throw new ExpressError('Company not found!', 404);
    }
    return results;
}

async function joinFind(code) {
    let results = await db.query(`SELECT * FROM companies JOIN invoices ON invoices.comp_code=companies.code WHERE code=$1`, [code]);
    if (results.rows.length === 0) {
        throw new ExpressError('Company/Invoice not found!', 404);
    }
    return results;
}

// routes for getting companies list
router.get('', async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.get('/:code', async function (req, res, next) {
    try {
        const code = req.params.code;
        let results = await joinFind(code);
        return res.json({ company: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.post('', async function (req, res, next) {
    try {
        const { code, name, description } = req.body;
        if (!code || !name || !description) {
            throw new ExpressError('Company code/name/description missing!', 400);
        }
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }
})

router.patch('/:code', async function (req, res, next) {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        if (!name || !description) {
            throw new ExpressError('Company name or description missing!', 400);
        }
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError('Company code not found!', 404);
        }
        return res.json(results.rows[0]);
    } catch (err) {
        return next(err);
    }
})

router.delete('/:code', async function (req, res, next) {
    try {
        const code = req.params.code;
        await find(code);
        await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
})

module.exports = router;