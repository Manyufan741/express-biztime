const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


async function joinFind() {
    let results = await db.query(`SELECT * FROM industries AS ind
    LEFT JOIN domains AS dom ON ind.ind_code=dom.industry_code
    LEFT JOIN companies AS comp ON dom.company_code=comp.code`);
    if (results.rows.length === 0) {
        throw new ExpressError('Industry not found!', 404);
    }
    return results;
}

router.get('', async function (req, res, next) {
    try {
        const results = await joinFind();
        return res.json({ industries: results.rows });
    } catch (err) {
        return next(err);
    }
})

router.post('', async function (req, res, next) {
    try {
        const { ind_code, industry } = req.body;
        if (!ind_code || !industry) {
            throw new ExpressError('ind_code/industry missing!', 400);
        }
        const result = await db.query(`INSERT INTO industries VALUES ($1, $2) RETURNING ind_code, industry`, [ind_code, industry]);
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }
})


module.exports = router;