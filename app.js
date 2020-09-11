/** BizTime express application. */
const express = require("express");
const app = express();
const db = require("./db");
const ExpressError = require("./expressError")
const companies_routers = require("./routes/companies");
const invoices_routers = require("./routes/invoices");

app.use(express.json());
app.use('/companies', companies_routers);
app.use('/invoices', invoices_routers);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
