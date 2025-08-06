/**
 * Syncs the most recent Google Form submission to a custom Apex REST service in Salesforce.
 */
function syncResponsesToSalesforce() {
  const form = FormApp.getActiveForm();
  const responses = form.getResponses();

  if (responses.length === 0) {
    Logger.log('No responses to sync.');
    return;
  }

  // Get latest submission
  const latestResponse = responses[responses.length - 1];
  const itemResponses = latestResponse.getItemResponses();

  // Build questions and answers array
  const questions = itemResponses.map(ir => ({
    question: ir.getItem().getTitle(),
    answer: ir.getResponse()
  }));

  // Build payload matching your Apex REST structure
  const payload = {
    formId: form.getId(),
    formUrl: form.getPublishedUrl(),
    submittedAt: getCurrentDateTimeISO8601(),
    formType: "Case Survey", // You can make this dynamic if needed
    questions: questions
  };

  const accessToken = PropertiesService.getScriptProperties().getProperty('SF_ACCESS_TOKEN');
  const salesforceEndpoint = PropertiesService.getScriptProperties().getProperty('SF_REST_ENDPOINT');

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    muteHttpExceptions: true
  };

  Logger.log('Payload: ' + JSON.stringify(payload));
  const response = UrlFetchApp.fetch(salesforceEndpoint, options);
  Logger.log('Response: ' + response.getContentText());
}

/**
 * Returns the current date-time in ISO 8601 format (Salesforce-compatible).
 */
function getCurrentDateTimeISO8601() {
  const timezone = Session.getScriptTimeZone();
  const now = new Date();
  return Utilities.formatDate(now, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSZ");
}
