const config = require("./config");
const mapExecutionService = require("../../../api/services/map-execution.service");
const Trigger = require("../../../api/models/map-trigger.model");

function alertWebhook(req,res) {
    let body = req.body
    Trigger.find({ plugin: config.name }).then((triggers) => {
        console.log(`Found ${triggers.length} triggers`);
        res.send('OK');
        triggers.forEach(trigger=>execTrigger(trigger,body,req.io))
    }).catch((error) => res.send(error))
}

function execTrigger (trigger, body,io) {
    new Promise ((resolve,reject) => {
        const eventType = body.event_type;
        const eventDescription = body.event_description;

        const triggerEventType = trigger.params.find(o => o.name === 'EVENT_TYPE');
        const triggerEventID = trigger.params.find(o => o.name === 'ID');
        if (triggerEventType.value != eventType) {
            return reject("Not matching event type name");
        }
        if (!eventDescription.includes(triggerEventID.value)) {
            return reject(`Not matching event ID name`);
        }
        return resolve()
    }).then(() => {
        console.log(trigger.map);
        let message = trigger.name + ' started by Lacework trigger'
        mapExecutionService.execute(trigger.map,null,io,{config: trigger.configuration},message,body);
    }).catch(err=>{
        console.error(err);
    })
}
module.exports = {
    ALERT_WEBHOOK: alertWebhook
}
