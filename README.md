# 📄 FormSync — Smart Feedback Automation for Salesforce

**FormSync** is a custom feedback automation solution that connects Salesforce with Google Forms and Google Apps Script. It enables organizations to send automated survey links to customers when cases are resolved — and seamlessly saves survey responses in Salesforce.
<img width="1920" height="1080" alt="FormSync Project (1)" src="https://github.com/user-attachments/assets/cc6f0345-45bb-47f2-a697-5aefce2149c4" />

--- 

## 💡 What It Does

- ❌ Replaces expensive tools like FormAssembly, Jotform, and other paid form builders  
- ✅ 100% customizable with **no ongoing license fees**  
- ⚙️ Built using Apex, Flow, and Google Apps Script.
- 🧠 Uses **OpenAI (via Agentforce)** and the **Einstein Trust Layer** to summarize case details securely before emailing customers

---

## 🔄 How It Works

When a Salesforce Case is marked as **Resolved**:

1. A **Record-Triggered Flow** is launched  
2. Salesforce calls OpenAI's Completions API (via Agentforce)  
   - Sensitive data is **filtered through the Einstein Trust Layer** before sending  
   - A summarized version of the case is generated and saved on the Case record  
3. An email is sent to the customer with a **Google Form survey link**  
4. The customer fills out the form  
5. A **Google Apps Script middleware** captures the form submission and sends it to a Salesforce **REST service**  
6. Salesforce parses the JSON payload and stores the responses in a **custom object (`Survey_Form__c`)**

---

## 🧱 Architecture Overview

### 🧰 Tech Stack

#### Salesforce
- Apex (REST class, summarization logic)
- Flow (Record-Triggered automation)
- Custom Object (`Survey_Form__c`)
- Agentforce (OpenAI integration)
- Einstein Trust Layer (PII/PHI masking)

#### Google
- Google Forms (survey UI)
- Google Apps Script (Javascript middleware POST to Salesforce)
- No paid tool required

#### External AI
- OpenAI `gpt-3.5-turbo` used for summarizing case data

---

## 🧠 Highlights

- 🎯 Free alternative to paid tools  
- 🧩 Extensible and customizable  
- 🛡️ Designed with **privacy**, **security**, and **scalability** in mind  
- 🔁 Can be modified to support any Salesforce object (Case, Contact, Custom Objects, etc.)  
- 📝 Survey form submissions, summaries, and links are stored in Salesforce  

---

## 📌 Admin Setup (One-Time)

### In Salesforce
- Create a custom object `Survey_Form__c` to store form data  
- Create flow to trigger on Case status = Resolved  
- Add fields: `Survey_Link__c`, `Case_Summary__c`, `Form_Questions_JSON__c`, etc.  
- Install/configure Agentforce for AI summarization  
- Secure Named Credential for the OpenAI endpoint  

### In Google Apps Script
- Write and deploy a middleware function to receive form submissions  
- The script will parse responses and POST to the Salesforce REST service  

---

## ⚖️ Why Not MuleSoft?

MuleSoft handles complex API integrations gracefully but is often **cost-prohibitive for smaller organizations**. FormSync offers a **zero-cost alternative** using native Salesforce capabilities and Google integrations.

---

## 📜 Licensing & Credits

This is a **personal project idea** made publicly available.  
Feel free to **customize or extend** it as needed.

> **⚠️ Disclaimer**  
> You may use and adapt this project for **non-commercial, internal, or personal purposes**.  
> Do not resell, rebrand, or republish it — in whole or in part — without the author's written consent.

---

**© David Elias**
