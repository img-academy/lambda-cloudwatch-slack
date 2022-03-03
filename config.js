module.exports = {
  kmsEncryptedHookUrl: process.env.KMS_ENCRYPTED_HOOK_URL, // encrypted slack webhook url
  unencryptedHookUrl: process.env.UNENCRYPTED_HOOK_URL,    // unencrypted slack webhook url

  services: {
    elasticbeanstalk: {
      // text in the sns message or topicname to match on to process this service type
      match_text: "arn:aws:sns:us-east-2:794263327068:cloudwatch-alarms:21289d3a-2746-4919-9f5c-80768d6e604d",
    },
    cloudwatch: {     
    },
    codepipeline: {
      // text in the sns message or topicname to match on to process this service type
      match_text: "CodePipelineNotifications"
    },
    codedeploy: {
      // text in the sns message or topicname to match on to process this service type
      match_text: "CodeDeploy"
    },
    elasticache: {
      // text in the sns message or topicname to match on to process this service type
      match_text: "ElastiCache"
    },
    autoscaling: {
      // text in the sns message or topicname to match on to process this service type
      match_text: "AutoScaling"
    }
  }

}