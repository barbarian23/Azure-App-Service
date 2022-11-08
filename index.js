const express = require('express');
//const bodyParser = require('body-parser');
const mssql = require('mssql');
const app = express();
const port = 3000;

const config = {
    server: "paas-web-test.database.windows.net",
    options: { encrypt: true, database: "LoadTest" },
    authentication: {
        type: "default",
        options: {
            userName: "cmdAdmin",
            password: "Admin@123456"
        }
    }

};

const pool = new mssql.ConnectionPool(config);

const resJson = (code, data, message) => {
    switch (code) {
        case 200:
            return {
                code: 200,
                status: 200,
                data: data
            }
        case 500:
            return {
                code: 500,
                status: 500,
                message: message
            }
        default:
            return;
    }
}

//app.use(bodyParser.json())

app.get('/', async (req, res) => {
    res.status(200).send("Hello world");
});

app.get('/getCountries', async (req, res) => {
    let connectionPool = await pool.connect();
    let result = await connectionPool.query("select top 100 * from countries");
    console.log("result",result);
    res.status(200).json(resJson(200, { result: result.recordset }, ''));
});

app.post('/insertNew', async (req, res) => {
    try {
        let countResult = await connectionPool.query("select count(*) as count from countries");

        let count = countResult.recordset[0].count;

        await connectionPool.query("insert into countries values(" + (count + 1) + ", 'Campuchia')");

        let countResultAfter = await connectionPool.query("select count(*) as count from countries");

        let result = await connectionPool.query("select top 100 * from countries");

        res.status(200).json(resJson(200, { result: result.recordset, message: "Query total " + countResultAfter.recordset[0].count }, ''));

        console.log("result", result);
    } catch (e) {
        res.status(500).json(resJson(500, '', e));
    }
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.post("/hook", (req, res) => {
    console.log(req.body, req.query);
    const alerts = req.body.alerts;

    res.status(200).end();
})
