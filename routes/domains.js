const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


// async function joinFind() {
//     let results = await db.query(`SELECT * FROM industries AS ind
//     LEFT JOIN domains AS dom ON ind.ind_code=dom.industry_code
//     LEFT JOIN companies AS comp ON dom.company_code=comp.code`);
//     if (results.rows.length === 0) {
//         throw new ExpressError('Industry not found!', 404);
//     }
//     return results;
// }

// router.get('', async function (req, res, next) {
//     try {
//         const results = await joinFind();
//         return res.json({ industries: results.rows });
//     } catch (err) {
//         return next(err);
//     }
// })

router.post('', async function (req, res, next) {
    try {
        const { company_code, industry_code } = req.body;
        if (!company_code || !industry_code) {
            throw new ExpressError('company_code/industry_code missing!', 400);
        }
        const result = await db.query(`INSERT INTO domains VALUES ($1, $2) RETURNING company_code, industry_code`, [company_code, industry_code]);
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        return next(err);
    }
})


module.exports = router;