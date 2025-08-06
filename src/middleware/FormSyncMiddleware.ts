function syncResponsesToSalesforce(): void {
  const form = FormApp.getActiveForm();
  if (!form) {
    Logger.log('No active form found.');
    return;
  }
  const responses = form.getResponses();

  if (responses.length === 0) {
    Logger.log('No responses to sync.');
    return;
  }

  // Get latest submission
  const latestResponse = responses[responses.length - 1];
  const itemResponses = latestResponse.getItemResponses();

  // Build questions and answers array
  const questions = itemResponses.map((ir: GoogleAppsScript.Forms.ItemResponse) => ({
    question: ir.getItem().getTitle(),
    answer: ir.getResponse()
  }));

  // Construct payload
  const payload: {
    formId: string;
    formUrl: string;
    submittedAt: string;
    formType: string;
    questions: { question: string; answer: string | string[] }[];
  } = {
    formId: form.getId(),
    formUrl: form.getPublishedUrl(),
    submittedAt: getCurrentDateTimeISO8601(),
    formType: 'Case Survey',
    questions
  };

  const accessToken = PropertiesService.getScriptProperties().getProperty('SF_ACCESS_TOKEN');
  const salesforceEndpoint = PropertiesService.getScriptProperties().getProperty('SF_REST_ENDPOINT');

  if (!accessToken || !salesforceEndpoint) {
    Logger.log('Missing Salesforce credentials or endpoint.');
    return;
  }

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
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

function getCurrentDateTimeISO8601(): string {
  const timezone = Session.getScriptTimeZone();
  const now = new Date();
  return Utilities.formatDate(now, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSZ");
}
