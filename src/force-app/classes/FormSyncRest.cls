@RestResource(urlMapping='/formsync/submit')
global with sharing class FormSyncRest {
    
    @HttpPost
    global static void handleSubmission() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();
        
        // Parse JSON payload
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(body);
        String formId         = (String) data.get('formId');
        String formUrl        = (String) data.get('formUrl');
        String submittedAtStr = (String) data.get('submittedAt');
        String formType       = (String) data.get('formType');
        List<Object> questions = (List<Object>) data.get('questions');
        
        // Extract email from questions
        String email;
        for (Object qObj : questions) {
            Map<String, Object> q = (Map<String, Object>) qObj;
            String question = (String) q.get('question');
            String answer = String.valueOf(q.get('answer'));
            if (String.isNotBlank(question) && question.toLowerCase().contains('email')) {
                email = answer?.trim();
                break;
            }
        }
        
        Id contactId;
        Id caseId;
        String caseSubject;
        Contact contactToUpdate;
        Case caseToUpdate;
        
        // Lookup Contact and Case by email
        if (String.isNotBlank(email)) {
            List<Contact> contacts = [
                SELECT Id, Name, Survey_Link_URL__c 
                FROM Contact 
                WHERE Email = :email 
                LIMIT 1
            ];
            if (!contacts.isEmpty()) {
                contactToUpdate = contacts[0];
                contactId = contactToUpdate.Id;
                caseSubject = contactToUpdate.Name;
                
                List<Case> cases = [
                    SELECT Id, Subject, Origin 
                    FROM Case 
                    WHERE ContactId = :contactId 
                    ORDER BY CreatedDate DESC 
                    LIMIT 1
                ];
                if (!cases.isEmpty()) {
                    caseToUpdate = cases[0];
                    caseId = caseToUpdate.Id;
                }
            }
        }
        
        // Parse submitted datetime
        DateTime submittedAt;
        try {
            submittedAt = DateTime.valueOf(submittedAtStr);
        } catch (Exception e) {
            submittedAt = System.now();
        }
        
        // Update Case if available
        if (caseToUpdate != null) {
            caseToUpdate.Origin = 'Web';
            caseToUpdate.Subject = caseSubject;
            update caseToUpdate;
        }
        
        // Update Contact's Survey_Link_URL__c if necessary
        if (contactToUpdate != null && contactToUpdate.Survey_Link_URL__c != formUrl) {
            contactToUpdate.Survey_Link_URL__c = formUrl;
            update contactToUpdate;
        }
        
        // Insert Survey_Form__c record
        Survey_Form__c survey = new Survey_Form__c(
            Google_Form_ID__c      = formId,
        Google_Form_URL__c     = formUrl,
        Form_Type__c           = formType,
        Submitted_At__c        = submittedAt,
        Form_Questions_JSON__c = JSON.serialize(questions),
        Is_Survey_Open__c      = true,
        Related_Contact__c     = contactId,
        Related_Case__c        = caseId
            );
        insert survey;
    }
}
