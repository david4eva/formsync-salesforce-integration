/**
 * Syncs the most recent Google Form submission to a custom Salesforce REST endpoint.
 */
function syncResponsesToSalesforce(): void {
  // Get the active Google Form; return if not running as a form-bound script
  const form = FormApp.getActiveForm();
  if (!form) {
    Logger.log('No active form found.');
    return;
  }
  
  // Fetch all submitted responses for this form
  const responses = form.getResponses();

  // Exit if no responses to process
  if (responses.length === 0) {
    Logger.log('No responses to sync.');
    return;
  }

  // Get the most recent (last) submission
  const latestResponse = responses[responses.length - 1];
  const itemResponses = latestResponse.getItemResponses();

  // Build array of questions and their submitted answers
  const questions = itemResponses.map((ir: GoogleAppsScript.Forms.ItemResponse) => ({
    question: ir.getItem().getTitle(),
    answer: ir.getResponse()  // May be string or string[] depending on item type
  }));

  // Build the payload to match your Salesforce REST API contract
  const payload: {
    formId: string;
    formUrl: string;
    submittedAt: string;
    formType: string;
    questions: { question: string; answer: string | string[] }[];
  } = {
    formId: form.getId(),
    formUrl: form.getPublishedUrl(),
    submittedAt: getCurrentDateTimeISO8601(), // ISO 8601 format
    formType: 'Case Survey',
    questions
  };

  // Retrieve Salesforce Access Token and endpoint from project properties
  const accessToken = PropertiesService.getScriptProperties().getProperty('SF_ACCESS_TOKEN');
  const salesforceEndpoint = PropertiesService.getScriptProperties().getProperty('SF_REST_ENDPOINT');

  // Exit early if credentials are missing
  if (!accessToken || !salesforceEndpoint) {
    Logger.log('Missing Salesforce credentials or endpoint.');
    return;
  }

  // Build HTTP request options for Salesforce REST API
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${accessToken}` // Bearer token authentication
    },
    muteHttpExceptions: true // Log errors instead of throwing
  };

  // Log payload for debugging
  Logger.log('Payload: ' + JSON.stringify(payload));

  // Send payload to Salesforce
  const response = UrlFetchApp.fetch(salesforceEndpoint, options);

  // Log the API response (success or error)
  Logger.log('Response: ' + response.getContentText());
}

/**
 * Returns the current date-time as a Salesforce-compatible ISO 8601 string.
 */
function getCurrentDateTimeISO8601(): string {
  const timezone = Session.getScriptTimeZone();
  const now = new Date();
  // Example: "2025-08-05T14:32:19.123-0500"
  return Utilities.formatDate(now, timezone, "yyyy-MM-dd'T'HH:mm:ss.SSSZ");
}
