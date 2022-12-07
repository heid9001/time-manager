const repo    = require('./db');
const axios = require('axios');
const moment = require('moment');
const apiKey = '5851661875:AAFO1p8wamCz9ipFb8JCyviMJfwn6rc1zl0';
const MINE_CHANNEL = '@ch56805887721'
const IRI_CHANNEL  = '@time00232232'
let channelName = MINE_CHANNEL;

/**
 function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
 * @param notify
 * @returns {*}
 */
exports.startWorker = function(notify) {

    return ()=> {
        return setInterval(() => {
            let db = repo.getDb();
            let tasks = repo.getExpiredEntries(db, moment().subtract(2, 'minute'));
            tasks.forEach(entry => {
                let msg = `скоро закончится ${entry.name}!`;
                notify(msg)
                sendMessage(msg);
                repo.expireEntry(db, entry.schemaId, entry.id);
            });
        }, 1000);
    }
}

function sendMessage(msg)
{
    msg = encodeURIComponent(msg);
    let url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${channelName}&text=${msg}`;
    axios.get(url)
        .then(response => {})
        .catch(error => {});
}
