const path    = require('path');
const express = require('express');
const repo    = require('./db');
const bodyParser = require('body-parser');
const app     = express()
const port    = 3232



function getTimeBalance(schema)
{
    let carry = 0;
    schema.entries.forEach((e, i) => {
        carry += e.time;
    });
    return schema.time - carry;
}
let db = repo.getDb();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(function(req, res, next) {
    res.setHeader('Connection', 'close');
    next();
});

// ok
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/dist/template.html').toString());
});

// ok
app.get('/schema/list', async (req, res)=>{
    db = repo.getDb();
    res.send(JSON.stringify(db.get("schemas").value()));
});

/**
 * ok
 * data: name, time
 */
app.post('/schema', async (req, res) => {
    repo.createSchema(db, req.body.name, req.body.time);
    res.send(JSON.stringify({status: 'ok'}));
});

/**
 * ok
 * валидация по остатку времени в группе
 * data: schemaId, to, name, time - время на перерыв, state
 */
app.post('/entry', async (req, res) => {
    let [schema] = db.get("schemas")
        .filter(s => s.id === req.body.schemaId)
        .value();
    if (getTimeBalance(schema) - req.body.time >= 0) {
        repo.addEntry(db,
            req.body.schemaId,
            req.body.from,
            req.body.to,
            req.body.name,
            parseInt(req.body.time),
            parseInt(req.body.state)
        );
        res.send(JSON.stringify({status: "ok"}));
    } else {
        res.send(JSON.stringify({status: "error"}));
    }
});

/**
 * ok
 * data: schemaId, entryIdx
 */
app.delete('/entry', async (req, res) => {
    repo.delEntry(db, req.body.schemaId, parseInt(req.body.entryId));
    res.send(JSON.stringify({status: "ok"}));
});

/**
 * ok
 * data: schemaId
 */
app.delete('/schema', async (req, res) => {
    repo.delSchema(db, req.body.schemaId);
    res.send(JSON.stringify({status: "ok"}));
});

exports.startApi = function() {
    let server = app.listen(port,()=>{});
    server.keepAliveTimeout = 2000;
    return server;
}

