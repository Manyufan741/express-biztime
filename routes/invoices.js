const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

async function find(id) {
    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
        throw new ExpressError('Invoice not found!', 404);
    }
    return results;
}

async function joinFind(id) {
    let results = await db.query(`SELECT * FROM invoices JOIN companies ON invoices.comp_code=companies.code WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
        throw new ExpressError('Invoice not found!', 404);
    }
    return results;
}

// routes for getting invoices list
router.get('', async function (req, res, next) {
    try {
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.get('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        let results = await joinFind(id);
        return res.json({ invoice: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.post('', async function (req, res, next) {
    try {
        const { comp_code, amt } = req.body;
        if (!comp_code || !amt) {
            throw new ExpressError('comp_code/amt missing!', 400);
        }
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }
})

router.patch('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        if (!amt) {
            throw new ExpressError('amt not specified!', 400);
        }
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError('Invoice id not found!', 404);
        }
        return res.json(results.rows[0]);
    } catch (err) {
        return next(err);
    }
})

router.delete('/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        await find(id);
        await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
})


module.exports = router;