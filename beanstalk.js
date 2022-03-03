const config = require('./config');

exports.handler = function(event, context) {
  if (event.Records[0].EventSubscriptionArn !== config.services.elasticbeanstalk.match_text) {
    return undefined;
  }
  const timestamp = (new Date(event.Records[0].Sns.Timestamp)).getTime()/1000;
  const subject = event.Records[0].Sns.Subject || "AWS Elastic Beanstalk Notification";
  const message = event.Records[0].Sns.Message;

  const stateRed = message.indexOf(" to RED");
  const stateSevere = message.indexOf(" to Severe");
  const butWithErrors = message.indexOf(" but with errors");
  const noPermission = message.indexOf("You do not have permission");
  const failedDeploy = message.indexOf("Failed to deploy application");
  const failedConfig = message.indexOf("Failed to deploy configuration");
  const failedQuota = message.indexOf("Your quota allows for 0 more running instance");
  const unsuccessfulCommand = message.indexOf("Unsuccessful command execution");

  const stateYellow = message.indexOf(" to YELLOW");
  const stateDegraded = message.indexOf(" to Degraded");
  const stateInfo = message.indexOf(" to Info");
  const removedInstance = message.indexOf("Removed instance ");
  const addingInstance = message.indexOf("Adding instance ");
  const abortedOperation = message.indexOf(" aborted operation.");
  const abortedDeployment = message.indexOf("some instances may have deployed the new application version");

  let color = "good";

  if (stateRed != -1 || stateSevere != -1 || butWithErrors != -1 || noPermission != -1 || failedDeploy != -1 || failedConfig != -1 || failedQuota != -1 || unsuccessfulCommand != -1) {
    color = "danger";
  }
  if (stateYellow != -1 || stateDegraded != -1 || stateInfo != -1 || removedInstance != -1 || addingInstance != -1 || abortedOperation != -1 || abortedDeployment != -1) {
    color = "warning";
  }

  const envIsProduction = message.indexOf("Environment: production") > 0;
  const healthRegex = /.+from\s(\w+)\sto\s(\w+)\..+/g;
  const healths = [...subject.matchAll(healthRegex)][0];
  const transitions = healthTransitions(subject);
  if (transitions) {
    if (isValidTransition(transitions)) {
      return {
        text: "*AWS Elastic Beanstalk Notification*",
        attachments: [
          {
            fields: [
              { title: "Name", value: "Environment health transitioned", short: false },
              { title: "From", value: transitions[0], short: true },
              { title: "To", value: transitions[1], short: true },
              { title: "Environment", value: envIsProduction ? "Production" : "Staging", short: false },
            ],
            color,
            ts: timestamp,
          }
        ],
      };
    } else {
      return null;
    }
  }
  const name = [...event.Records[0].Sns.Subject.matchAll(/^AWS Elastic Beanstalk Notification - (.+)\.$/g)][0][1];
  const description = message.split('\n')
    .map(token => [...token.matchAll(/Message: (.+)\./g)])
    .flatMap(a => a)
    .flatMap(a => a)
    [1]

  return {
    text: "*AWS Elastic Beanstalk Notification*",
    attachments: [
      {
        "fields": [
          { title: "Name", value: description, "short": false },
          { title: "Environment", value: envIsProduction ? "Production" : "Staging", short: false },
        ],
        "color": color,
        "ts":  timestamp
      }
    ]
  };
};

function healthTransitions(subject) {
  const healthRegex = /.+from\s(\w+)\sto\s(\w+)\..+/g;
  const healths = [...subject.matchAll(healthRegex)][0];
  if (Array.isArray(healths) && healths.length > 0) {
    const previousHealth = healths[1];
    const currentHealth = healths[2];
    return [previousHealth, currentHealth];
  } else {
    return null;
  }
}

function isValidTransition(transitions) {
  const [previous, current] = transitions;
  if (previous == "Info" && current == "Ok") { return false }
  if (previous == "Ok" && current == "Info") { return false }
  return true;
}
