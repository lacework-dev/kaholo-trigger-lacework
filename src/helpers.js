const config = require("./config");
const mapExecutionService = require("../../../api/services/map-execution.service");
const Trigger = require("../../../api/models/map-trigger.model");

function findTriggers(validatationFn, startParams, req, res, method, description) {
  Trigger.find({ plugin: config.name, method: method})
    .then((triggers) => {
      console.log(`Found ${triggers.length} triggers`);
      res.send("OK");
      triggers.forEach((trigger) => {
        validatationFn(trigger, startParams)
          .then(exec(trigger, req.body, req.io, description))
          .catch(console.error);
      });
    })
    .catch((error) => res.send(error));
}

function exec(trigger, body, io, description) {
  return () => {
    console.log(trigger.map);
    const message = `${trigger.name}, event: ${description}`;
    console.log(`******** Lacework: executing map ${trigger.map} ********`);
    mapExecutionService.execute(
      trigger.map,
      null,
      io,
      { config: trigger.configuration },
      message,
      body
    );
  };
}

module.exports = { findTriggers };
