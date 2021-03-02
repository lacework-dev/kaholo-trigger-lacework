const { findTriggers } = require("./helpers");

function alertWebhook(req, res) {
    const body = req.body;

    const eventType = body.event_type; // Get event type
    const eventDescription = body.event_description; // Get event ID
    const eventSeverity = body.event_severity; // Get event severity 
    const eventTitle = body.event_title; // Get event severity
    if (!eventType || !eventDescription || !eventSeverity){
        throw "bad lacework alert format";
    }

    findTriggers(
      validateTrigger,
      { eventType, eventDescription, eventSeverity },
      req, res, "alertWebhook",
      `${eventTitle} - severity ${eventSeverity}` // event description for kaholo
    );
}
  
async function validateTrigger(trigger, { eventType, eventDescription, eventSeverity }) {
    const triggerEventType = trigger.params.find((o) => o.name === "eventType").value || "any";
    const triggerEventId = (trigger.params.find((o) => o.name === "id").value || "").trim();
    const triggerEventSeverity = trigger.params.find((o) => o.name === "eventSeverity").value || "any";
    /**
     * if event type was provided check it matches event type in post request
     */
    if (triggerEventType !== "any" && eventType !== triggerEventType) {
      throw "Not same event type";
    }
    /**
     * if event ID was provided check it matches event ID in post request
     */
    if (triggerEventId && !eventDescription.includes(` ${triggerEventId} `)){
        throw "Not same event ID";;
    }
    if (triggerEventSeverity != "any" && eventSeverity != triggerEventSeverity){
      throw "Not same event severity";
    }
    return true;
}
  
module.exports = { alertWebhook }
