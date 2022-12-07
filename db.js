const os        = require('os');
const path      = require('path');
const lowdb     = require('lowdb');
const FileSync  = require("lowdb/adapters/FileSync");
const uuid      = require("uuid")
const moment    = require("moment")


const DATE_FORMAT = "DD.MM.YYYYTHH:mm:ss"


function getDb() {
    let dbPath = path.join(os.tmpdir(), 'time-manager.json');
    let adapter = new FileSync(dbPath);
    let db = lowdb(adapter);
    db.defaults({ schemas: []}).write();
    return db;
} exports.getDb = getDb;

/**
 * tested
 * Получаем группу по uuidv4
 * @param db
 * @param id
 * @returns {*}
 */
function delSchema(db, id)
{
    db.get("schemas").remove({ id }).write();
} exports.delSchema = delSchema;

/**
 * tested
 * @param db
 * @param schemaId
 * @param entryIdx
 */
function delEntry(db, schemaId, entryIdx)
{
    let data = db.get("schemas").value();
    let [schema] = data.filter( s => s.id === schemaId );
    if (schema) {
        schema.entries.splice(entryIdx, 1);
    }
    db.set("schemas", data).write();
} exports.delEntry = delEntry;

/**
 *
 * @param db
 * @param schemaId
 * @param entryIdx
 */
function expireEntry(db, schemaId, entryIdx)
{
    let data = db.get("schemas").value();
    let [schema] = data.filter( s => s.id === schemaId );
    if (schema) {
        let [entry] = schema.entries.filter( e => e.id === entryIdx);
        if (entry) {
            entry.state = 1;
        }
    }
    db.set("schemas", data).write();
} exports.expireEntry = expireEntry;

/**
 * Получаем все таски
 * @param db
 * @returns {[]}
 */
function getAllEntries(db)
{
    let entries = [];
    db.get("schemas").value().forEach( s => entries = entries.concat(s.entries));
    return entries;
} exports.getAllEntries = getAllEntries;

/**
 * tested
 * Получаем просроченные таски относительно текущей метки времени
 * @param db
 * @param now
 * @returns {*[]}
 */
function getExpiredEntries(db, now)
{
    return getAllEntries(db).filter(e => moment(e.to).diff(now) <= 0 && e.state === 0);
} module.exports.getExpiredEntries = getExpiredEntries;


// tested
function createSchema(db, name, time, entries = [])
{
    db.get("schemas").push({
        id:   uuid.v4(),
        qty: 0,
        name, time, entries
    }).write();
} module.exports.createSchema = createSchema;

// tested
function addEntry(
    db,
    schemaId,
    from,
    to,
    name,
    time,
    state
)
{
    let schemas = db.get("schemas").value();
    let [schema] = schemas.filter( s => s.id === schemaId );
    if (schema) {
        schema.entries.push({
            id: schema.entries.length,
            schemaId,
            from,
            to,
            name,
            time,
            state
        });
        db.set("schemas", schemas).write();
    }
} module.exports.addEntry = addEntry;
