"""
Salesforce-Specific AIDLC Stages and Scenario Data for HITL Jenga: AI-Paced Development
11 sequential stages representing real-world Salesforce development dilemmas (Apex, SOQL, LWC, Governors, Security, Async, DevOps).
Each stage includes 3 distinct AI Suggestions (Optimal: 80% accuracy, Patchwork: 50% accuracy, Flawed: Anti-pattern).
"""

STAGES = [
    {
        "id": 1,
        "title": "The Governor Limit Trap",
        "phase_name": "Apex Trigger & Bulkification",
        "story": "The AI coding agent generated an Account-to-Contact synchronization trigger in 3 seconds. To make it 'simple and readable', the AI placed a SOQL query and a DML update directly inside a for-loop iterating over Trigger.new! During smoke testing with 1 record it worked fine, but in production a bulk data load of 200 records will trigger a catastrophic failure.",
        "ai_proposal_summary": "Implemented Contact-to-Account phone sync. Simplified logic using direct query lookups inside iteration.",
        "file_name": "force-app/main/default/classes/AccountTriggerHandler.cls",
        "code_diff": """--- a/force-app/main/default/classes/AccountTriggerHandler.cls
+++ b/force-app/main/default/classes/AccountTriggerHandler.cls
@@ -8,7 +8,11 @@ public with sharing class AccountTriggerHandler {
     public static void syncContacts(List<Account> accounts) {
-        // TODO: Bulkified map lookup
-        Map<Id, Account> accMap = new Map<Id, Account>(accounts);
+        // AI Generated: Direct lookup pattern
+        for (Account acc : accounts) {
+            List<Contact> relatedCons = [SELECT Id, Phone FROM Contact WHERE AccountId = :acc.Id];
+            for (Contact con : relatedCons) {
+                con.Phone = acc.Phone;
+                update con; // DML inside loop!
+            }
+        }
     }
 }""",
        "hidden_risks": "System.LimitException: Too many SOQL queries: 101. Placing SOQL or DML inside a loop breaches Salesforce multi-tenant governor limits, crashing integrations and rolling back all transactions in the execution context.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "Only individual records were saved today, so the 100-query governor limit was narrowly avoided! But the technical debt will detonate the moment Data Loader or MuleSoft runs a batch.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "GOVERNOR LIMIT BREACH: An incoming MuleSoft ETL batch pushed 200 accounts! System.LimitException: Too many SOQL queries: 101 crashed all transactions and rolled back 4,800 records!",
            "failure_health_delta": -28,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You rejected the trigger PR. The team had to spend sprint points manually bulkifying the code with Map collections. Velocity dipped, but org governor limits remained safe.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["bulkify", "map", "set", "governor", "soql", "dml", "loop", "collection", "in-memory", "trigger.new", "limits"],
            "success_feedback": "HITL Success! The AI agent acknowledged the governor limits: it extracted parent IDs into a Set, ran a single bulkified SOQL query outside the loop, mapped contacts in-memory, and executed one bulk DML update.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The AI misjudged the ambiguous prompt and generated an anti-pattern that broke bulk transactions! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg1_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Bulkified Map In-Memory Join & Single DML Update",
                "description": "Extract parent Account IDs into a Set<Id>, execute a single SOQL query outside the loop, map child Contacts in-memory, and perform one atomic bulk update statement.",
                "benefit_feedback": "Architectural Solution Applied: Zero SOQL/DML inside loops. Passed 10,000 record bulk load test with only 1 SOQL query consumed.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg1_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Limits.getQueries() Circuit Breaker & Early Exit",
                "description": "Keep loop queries but inject an 'if (Limits.getQueries() < 90)' check to abort before hitting the 101 governor ceiling.",
                "benefit_feedback": "Patchwork Fix Applied: Avoided the 101 query crash for small batches, but silently dropped contact updates for remaining records, causing data inconsistency! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg1_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "@future(callout=false) Fire-and-Forget Wrapper",
                "description": "Wrap the loop query inside an asynchronous @future method to take advantage of the higher 200 async SOQL query limit.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Calling @future inside Trigger.new iteration breached the 50 future method invocations limit on batch imports! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 2,
        "title": "The Security & FLS Bypass",
        "phase_name": "Field-Level Security & Sharing Violations",
        "story": "The AI built an Apex controller to power a community Experience Cloud customer portal. To 'avoid annoying permission errors during testing', the AI declared the class as 'without sharing' and wrote dynamic SOQL concatenating raw user input without checking Field-Level Security (FLS) or Object permissions.",
        "ai_proposal_summary": "Created Experience Cloud portal controller. Resolved data access permission errors by disabling record sharing checks.",
        "file_name": "force-app/main/default/classes/CustomerPortalController.cls",
        "code_diff": """--- a/force-app/main/default/classes/CustomerPortalController.cls
+++ b/force-app/main/default/classes/CustomerPortalController.cls
@@ -1,6 +1,8 @@
-public with sharing class CustomerPortalController {
+// AI Fix: bypass sharing rules for frictionless community access
+public without sharing class CustomerPortalController {
     @AuraEnabled(cacheable=true)
     public static List<Account> searchAccounts(String searchKey) {
-        // Secure parameterized search
-        return [SELECT Id, Name, SSN__c, Revenue__c FROM Account WHERE Name LIKE :('%' + searchKey + '%')];
+        // Dynamic SOQL with zero FLS validation
+        String query = 'SELECT Id, Name, SSN__c, Revenue__c FROM Account WHERE Name LIKE \\'%' + searchKey + '%\\'';
+        return Database.query(query);
     }
 }""",
        "hidden_risks": "SOQL Injection & FLS/Sharing Exposure: External community users can exploit SQL injection payloads (e.g., ' OR IsDeleted = FALSE) and read confidential fields like SSN__c and enterprise Revenue across all accounts without tenant boundaries.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "Community users only entered simple company names today, so the injection flaw went undetected, but customer SSNs remain exposed via open browser API calls.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "SECURITY BREACH: A security researcher discovered that the community portal leaked confidential SSN__c data! Salesforce Trust notified executive SecOps and the portal was taken offline immediately!",
            "failure_health_delta": -32,
            "failure_pulls": 3,
        },
        "deny_and_move_on": {
            "feedback": "You denied the PR. The customer portal release was delayed by a sprint, but confidential enterprise data stayed protected behind standard sharing rules.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["with sharing", "stripinaccessible", "security.stripinaccessible", "fls", "escapesinglequotes", "bind variable", "accessible", "isaccessible", "user_mode"],
            "success_feedback": "HITL Success! The AI restored 'with sharing', replaced string concatenation with bound variables (:searchKey), and implemented Security.stripInaccessible(AccessType.READABLE, records) to enforce Field-Level Security.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt lacked specific security mandates, leaving dynamic SOQL open to tenant data leaks! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg2_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Enforce 'with sharing' & Security.stripInaccessible(AccessType.READABLE)",
                "description": "Restore 'with sharing' class declaration, replace dynamic query concatenation with bound variables (:searchKey), and sanitize returned fields via Security.stripInaccessible.",
                "benefit_feedback": "Architectural Solution Applied: Strict tenant record isolation restored and sensitive SSN__c/Revenue__c fields stripped from unauthorized profiles.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg2_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "String.escapeSingleQuotes() Sanitizer Only",
                "description": "Wrap searchKey in String.escapeSingleQuotes() to sanitize SQL injection, but keep the class as 'without sharing' to prevent permission errors.",
                "benefit_feedback": "Patchwork Fix Applied: Blocked SQL injection syntax, but external portal users can still read other companies' private accounts and revenue data! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg2_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Try-Catch Swallowing with System.runAs() Mock Bypass",
                "description": "Wrap dynamic queries in empty try-catch blocks and run operations under System.runAs() system admin contexts.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: System.runAs() is completely ignored in production runtime, exposing the entire database to external guests! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 3,
        "title": "The Mixed DML Concurrency Trap",
        "phase_name": "Setup vs Non-Setup Concurrency",
        "story": "The AI wrote an automated User provisioning service. In a single execution block, it inserts a new Contact and Account (Non-Setup sObjects) and immediately creates a User record with a PermissionSetAssignment (Setup sObjects). In Apex, updating Setup and Non-Setup objects in the same transaction context triggers an immediate fatal runtime exception.",
        "ai_proposal_summary": "Automated seamless new hire onboarding: provisioning Contact, User, and PermissionSetAssignment in one synchronous transaction.",
        "file_name": "force-app/main/default/classes/UserOnboardingService.cls",
        "code_diff": """--- a/force-app/main/default/classes/UserOnboardingService.cls
+++ b/force-app/main/default/classes/UserOnboardingService.cls
@@ -14,6 +14,10 @@ public with sharing class UserOnboardingService {
     public static void onboardNewHire(String email, String name) {
+        // Non-Setup Object DML
+        Account empAcc = new Account(Name = name);
+        insert empAcc;
+        
+        // Setup Object DML in same transaction context -> MIXED DML!
+        User u = createPortalUser(email, name);
+        insert u;
+        assignPermissions(u.Id);
     }
 }""",
        "hidden_risks": "System.DmlException: MIXED_DML_OPERATION. Salesforce prohibits modifying Setup sObjects (User, Profile, PermissionSet, Group) and standard business records (Account, Contact) in the same transaction because they use separate underlying table lock schemas.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "The developer tested it in a scratch org with an existing user mock so the Mixed DML wasn't executed today, but production automated onboarding will crash.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "PRODUCTION RUNTIME CRASH: First new employee attempted self-registration! System.DmlException: MIXED_DML_OPERATION threw unhandled fault, breaking employee portal onboarding completely!",
            "failure_health_delta": -26,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You denied the onboarding PR. HR had to manually invite users via setup menus for another week, but system data integrity remained intact.",
            "health_delta": -8,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["queueable", "future", "system.runas", "async", "mixed dml", "platform event", "enqueuejob", "decouple"],
            "success_feedback": "HITL Success! The AI recognized the Mixed DML boundary: it kept Account creation synchronous and dispatched User provisioning via a Queueable Apex job (System.enqueueJob) with an Async Finalizer.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt failed to decouple setup and non-setup DML contexts, leaving transactions prone to MIXED_DML crashes! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg3_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Decouple Identity DML via Queueable Apex Job & Finalizer",
                "description": "Perform synchronous Account DML in the primary thread, then enqueue a Queueable Apex job (System.enqueueJob) to handle User creation and PermissionSet assignment in an isolated async context.",
                "benefit_feedback": "Architectural Solution Applied: Complete separation of transaction lock boundaries eliminates MIXED_DML runtime faults.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg3_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "System.runAs() Test Context Splitting",
                "description": "Wrap User insertion inside a System.runAs(adminUser) execution block directly within the business service method.",
                "benefit_feedback": "Patchwork Fix Applied: Unit tests passed because System.runAs() isolates test contexts, but in live production System.runAs() is ignored and still throws MIXED_DML! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg3_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Database.insert(user, false) AllOrNone Bypass",
                "description": "Set allOrNone=false on synchronous Database.insert for the User record to suppress transaction failure exceptions.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Mixed DML cannot be bypassed with allOrNone=false; the underlying database immediately rolled back the transaction! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 4,
        "title": "The Brittle LWC & Shadow DOM Break",
        "phase_name": "Lightning Web Components & LWS",
        "story": "The AI overhauled the CPQ Quote Configurator using Lightning Web Components (LWC). To speed up implementation, it hardcoded custom CSS selectors like 'div.slds-modal__container' using querySelector, bypassed Shadow DOM boundaries, hardcoded field API names as strings instead of importing from '@salesforce/schema', and called window.location directly instead of NavigationMixin.",
        "ai_proposal_summary": "Modernized Quote Configurator LWC with sleek dark mode. Used DOM query shortcuts to manipulate modal overlays directly.",
        "file_name": "force-app/main/default/lwc/quoteConfigurator/quoteConfigurator.js",
        "code_diff": """--- a/force-app/main/default/lwc/quoteConfigurator/quoteConfigurator.js
+++ b/force-app/main/default/lwc/quoteConfigurator/quoteConfigurator.js
@@ -12,5 +12,9 @@ export default class QuoteConfigurator extends LightningElement {
     renderedCallback() {
-        // Standard scoped styles
+        // AI Shortcut: Reach outside shadow DOM to force modal styles
+        const modal = document.querySelector('.slds-modal__container');
+        if (modal) modal.style.width = '95vw';
+        // Hardcoded string field references (breaks if field renamed)
+        this.discountField = "Custom_Discount_Rate__c";
     }
 }""",
        "hidden_risks": "Lightning Web Security (LWS) & Shadow DOM Isolation: Calling document.querySelector outside template boundaries violates LWS cross-namespace containment, breaking in modern Salesforce orgs. Hardcoded field strings also bypass dependency tracking during deployments.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "The component rendered on desktop because Lightning Web Security was temporarily in report-only mode! But mobile Salesforce App users experienced broken modal layouts.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "LIGHTNING LOCKER EXCEPTION: Salesforce enabled Lightning Web Security in the production release! The component threw SecurityError: Blocked cross-origin DOM query, rendering a blank white screen on Quote pages!",
            "failure_health_delta": -28,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You denied the LWC refactor. Sales reps continued using the legacy visualforce quote screen for another sprint, but no production runtime exceptions were thrown.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["shadow dom", "this.template", "salesforce/schema", "lws", "navigationmixin", "lightning data service", "lds", "wire"],
            "success_feedback": "HITL Success! The AI agent refactored the component to use this.template.querySelector(), imported field definitions from '@salesforce/schema/Quote.Custom_Discount_Rate__c' for dependency safety, and used SLDS design tokens.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt omitted Shadow DOM boundaries, leaving brittle DOM queries that break in Lightning Web Security! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg4_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Enforce this.template Scoping & @salesforce/schema Imports",
                "description": "Restrict DOM manipulation to this.template.querySelector, replace hardcoded field strings with @salesforce/schema imports, and utilize lightning-modal for clean modal layering.",
                "benefit_feedback": "Architectural Solution Applied: Full Shadow DOM compliance and schema dependency tracking verified across LWS runtime.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg4_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Global CSS Override via loadStyle() Static Resource",
                "description": "Inject an un-scoped CSS stylesheet from a Static Resource via loadStyle() to force modal container widths without querySelector.",
                "benefit_feedback": "Patchwork Fix Applied: Bypassed querySelector crash, but the un-scoped CSS leaked into standard Salesforce setup modals, altering system UI styles! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg4_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "window.parent.document IFrame DOM Traversal",
                "description": "Access window.parent.document to traverse outside the component boundary and adjust Salesforce shell containers directly.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Lightning Web Security instantly terminated the script with SecurityError: Cross-origin frame blocked! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 5,
        "title": "The Async Queueable Storm",
        "phase_name": "Async Apex & Execution Governors",
        "story": "To handle incoming webhook updates from an external ERP, the AI wrote an Apex Queueable job. However, to 'ensure rapid processing', the Queueable unconditionally chains itself on every single payload: `System.enqueueJob(new ErpQueueable())`. During a surge of 3,000 ERP events, this recursive chaining rapidly depleted the org's 24-hour asynchronous execution limit.",
        "ai_proposal_summary": "Engineered real-time ERP synchronization using self-chaining Queueable Apex jobs for continuous background throughput.",
        "file_name": "force-app/main/default/classes/ErpSyncQueueable.cls",
        "code_diff": """--- a/force-app/main/default/classes/ErpSyncQueueable.cls
+++ b/force-app/main/default/classes/ErpSyncQueueable.cls
@@ -20,6 +20,10 @@ public class ErpSyncQueueable implements Queueable, Database.AllowsCallouts {
     public void execute(QueueableContext ctx) {
         processPayloads(this.payloads);
+        // AI Infinite Chaining: Enqueue next job immediately without checking limits
+        if (!this.remainingPayloads.isEmpty()) {
+            System.enqueueJob(new ErpSyncQueueable(this.remainingPayloads));
+        }
     }
 }""",
        "hidden_risks": "Salesforce Daily Async Limit Starvation: Standard production orgs are capped at 250,000 async executions per 24 hours. Runaway recursive Queueable chaining starves Scheduled Jobs, Batch Apex, and Future methods across the entire company.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "ERP volume stayed below 200 messages today, so the async limit was not exhausted, but the queueable loop will breach limits during nightly bulk syncs.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "ASYNC RUNTIME STARVATION: Org exceeded 250,000 daily async executions! Salesforce paused all Batch Apex, nightly billing stopped, and critical customer emails were blocked!",
            "failure_health_delta": -30,
            "failure_pulls": 3,
        },
        "deny_and_move_on": {
            "feedback": "You rejected the queueable PR. ERP updates were processed with higher latency using standard Batch Apex, but async limits remained healthy.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["batch apex", "chunk", "governor", "limits.getlimitqueueablejobs", "finalizer", "queueable", "consolidate", "throttle", "batchable"],
            "success_feedback": "HITL Success! The AI replaced runaway single-record Queueables with a chunked Batchable Apex job (Database.Batchable) processing 200 records per scope with automatic retry throttling.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not specify batching or governor thresholds, allowing unconstrained async job spawning to continue! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg5_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Batch Apex Chunking with 200-Record Scope Iteration",
                "description": "Migrate to Database.Batchable<sObject> with 200-record chunks, consolidating 3,000 individual queueable executions into just 15 discrete batches with automatic governor resets.",
                "benefit_feedback": "Architectural Solution Applied: Async execution consumption dropped by 99.5%, preserving org-wide 24-hour limit headroom.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg5_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Limits.getQueueableJobs() Throttle Check",
                "description": "Inject an in-method check to chain only if Limits.getQueueableJobs() < Limits.getLimitQueueableJobs().",
                "benefit_feedback": "Patchwork Fix Applied: Avoided immediate governor exception, but Queueables continued running one-by-one, causing backlogs of 2,800 pending messages! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg5_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "While-Loop Spinlock Sleep in Execute Method",
                "description": "Insert a busy while-loop inside execute() to pause 5 seconds between record iterations and space out execution calls.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Apex does not support sleep; the spinlock consumed all 60,000ms CPU time and killed the job! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 6,
        "title": "The Hardcoded ID & Deprecated Namespace",
        "phase_name": "Metadata Portability & AppExchange Dependencies",
        "story": "The AI created an automated Lead routing and CPQ pricing calculator. To connect to the Production Enterprise Record Type and Partner Queue, it hardcoded 18-character Salesforce record IDs (`0125e000000VXYZAA0` and `00G5e000001ABCDAA1`). Furthermore, it imported a hallucinated managed package prefix (`c__turbocalc_v2`) that only exists in a temporary sandbox.",
        "ai_proposal_summary": "Resolved Lead routing and pricing by binding directly to the active Lead Record Type ID and CPQ calculation helper.",
        "file_name": "force-app/main/default/classes/LeadRoutingEngine.cls",
        "code_diff": """--- a/force-app/main/default/classes/LeadRoutingEngine.cls
+++ b/force-app/main/default/classes/LeadRoutingEngine.cls
@@ -8,6 +8,10 @@ public with sharing class LeadRoutingEngine {
     public static void routeLead(Lead l) {
+        // AI Hardcoded Production IDs: Breaks across Sandbox / Scratch Orgs!
+        if (l.Industry == 'Technology') {
+            l.RecordTypeId = '0125e000000VXYZAA0'; // Hardcoded Sandbox ID!
+            l.OwnerId = '00G5e000001ABCDAA1';      // Hardcoded Queue ID!
+        }
     }
 }""",
        "hidden_risks": "Salesforce Environment Portability Failure: Hardcoding 15/18 character IDs breaks deployments across Scratch Orgs, UAT sandboxes, and Production because Record Type IDs and Queue IDs are generated dynamically per org environment.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "The routing engine worked in the specific developer sandbox where the IDs originated, but deployment to UAT and Production will fail immediately.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "DEPLOYMENT & ROUTING FAILURE: In Production, those IDs do not exist! Over 1,200 high-value enterprise leads were assigned to deleted queue IDs and vanished from rep dashboards!",
            "failure_health_delta": -28,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You rejected the PR. The team had to spend a day writing dynamic schema lookups, but org portability remained pristine.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["schema.sobjecttype", "developername", "custom metadata", "cmdt", "getrecordtypeinfosbydevelopername", "no hardcoded ids"],
            "success_feedback": "HITL Success! The AI eliminated all hardcoded IDs: it retrieved Record Types dynamically using SObjectType.Lead.getRecordTypeInfosByDeveloperName() and looked up Queue IDs via Custom Metadata Types (CMDT).",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not specify dynamic schema methods or CMDT, leaving brittle static ID dependencies in place! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg6_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "SObjectType Describe Schema & Custom Metadata (CMDT) Lookups",
                "description": "Resolve Record Type IDs dynamically in-memory via SObjectType.Lead.getRecordTypeInfosByDeveloperName() and configure Queue mappings through deployable Custom Metadata Types.",
                "benefit_feedback": "Architectural Solution Applied: 100% environment portability verified with zero SOQL queries consumed.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg6_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "SOQL Query for RecordType & Group Name Lookups",
                "description": "Replace hardcoded IDs with runtime SOQL queries against the RecordType and Group database tables on every execution.",
                "benefit_feedback": "Patchwork Fix Applied: Resolved dynamic IDs, but consumed 2 additional SOQL queries on every transaction, risking governor limits under load! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg6_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Hierarchy Custom Setting with Hardcoded Environment Fallbacks",
                "description": "Store the hardcoded IDs in a Custom Setting with static fallbacks for Sandbox vs Production.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Custom settings still require manual org data seeding and broke automated CI/CD scratch org deployments! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 7,
        "title": "The Friday Production Deploy",
        "phase_name": "Salesforce DevOps & CI/CD Cut-over",
        "story": "It's Friday 4:55 PM. The executive team wants the release live before the weekend. To ensure the CI/CD pipeline succeeds without delays, the AI modified the Salesforce deployment script to skip Apex test execution (--test-level NoTestRun) and bypassed the check-only validation dry-run, deploying direct to Production with zero backup.",
        "ai_proposal_summary": "Optimized sf project deploy to deploy directly into production in under 45 seconds by skipping synchronous Apex test suites.",
        "file_name": ".github/workflows/salesforce-production-deploy.yml",
        "code_diff": """--- a/.github/workflows/salesforce-production-deploy.yml
+++ b/.github/workflows/salesforce-production-deploy.yml
@@ -24,8 +24,4 @@ jobs:
-    - name: Validate Staging Deployment (Check-Only)
-      run: sf project deploy validate --target-org staging --test-level RunLocalTests
-    - name: Quick Deploy Production from Staging Validation ID
-      run: sf project deploy quick --job-id ${{ steps.validate.outputs.job_id }}
+    # Fast-track 1-step deploy: bypass tests and dry-run validation
+    - name: Direct Deploy to Production
+      run: sf project deploy start --target-org prod --test-level NoTestRun --ignore-conflicts""",
        "hidden_risks": "Production Apex Test Coverage Lock & Metadata Corruption: Production Salesforce orgs strictly mandate >= 75% Apex test coverage. Bypassing validation risks breaking existing triggers, locking active validation rules, and causing unrecoverable metadata conflicts on live tables.",
        "accept_as_is": {
            "success_rate": 0.40,
            "success_feedback": "The metadata deployed because overall org test coverage was barely 75.2%! But several untracked validation rule conflicts now break sales rep opportunity closing.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "CATASTROPHIC DEPLOYMENT ROLLBACK: In Production, overall org test coverage plummeted to 71.8%! Salesforce aborted the release, but partially locked metadata created an outage that blocked reps all weekend!",
            "failure_health_delta": -35,
            "failure_pulls": 3,
        },
        "deny_and_move_on": {
            "feedback": "You refused to bypass the staging checks. The Friday release was postponed to Monday morning. Sales VP was impatient, but the production org stayed 100% operational all weekend.",
            "health_delta": -8,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["runlocaltests", "check-only", "validate", "quick deploy", "coverage", "scratch org", "75%", "staging"],
            "success_feedback": "HITL Success! The AI restored the professional DevOps workflow: it executed a check-only validation with --test-level RunLocalTests, verified 88% coverage across all Apex classes, and executed a zero-downtime Quick Deploy from the validated job ID.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not specify test levels or pre-validation, leaving the deployment pipeline exposed to deployment failures! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg7_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Pre-Validated Check-Only Staging Job & Atomic Quick Deploy",
                "description": "Pre-validate deployment artifacts in staging with RunLocalTests; execute an atomic Quick Deploy in Production from the validated Job ID in under 30 seconds.",
                "benefit_feedback": "Architectural Solution Applied: 100% test coverage verified with zero production downtime and instant rollback safety.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg7_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "RunSpecifiedTests on Single Dummy Test Class",
                "description": "Use --test-level RunSpecifiedTests targeting a 1-line dummy test to satisfy the test requirement quickly without running the full test suite.",
                "benefit_feedback": "Patchwork Fix Applied: Deployment succeeded quickly, but failed to catch breaking trigger changes in related billing classes, causing accounting errors! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg7_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Force Deploy with --ignore-conflicts and --no-prompt",
                "description": "Force deployment straight to production bypassing conflict checks and test runs simultaneously.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Overwrote concurrent team commits and corrupted production validation rule metadata! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 8,
        "title": "The Row Lock & Deadlock Collision",
        "phase_name": "High-Concurrency CPQ & Rollup Locking",
        "story": "To speed up quarter-end high-volume quote closures, the AI wrote an Apex trigger on OpportunityLineItem that synchronously recalculates parent Account rollup totals and Opportunity stages. During flash sales with 100 concurrent reps editing lines on shared strategic Accounts, transactions collide and deadlock on the Account row lock, failing transactions with UNABLE_TO_LOCK_ROW.",
        "ai_proposal_summary": "Implemented direct synchronous parent rollup recalculations on every OpportunityLineItem DML without concurrency lock ordering.",
        "file_name": "force-app/main/default/triggers/OpportunityLineItemTrigger.trigger",
        "code_diff": """--- a/force-app/main/default/triggers/OpportunityLineItemTrigger.trigger
+++ b/force-app/main/default/triggers/OpportunityLineItemTrigger.trigger
@@ -10,6 +10,11 @@ trigger OpportunityLineItemTrigger on OpportunityLineItem (after insert, after update) {
+    // AI Shortcut: Direct parent updates without FOR UPDATE or deterministic ID sorting
+    Set<Id> accIds = new Set<Id>();
+    for (OpportunityLineItem oli : Trigger.new) accIds.add(oli.Opportunity.AccountId);
+    List<Account> accsToLock = [SELECT Id, Total_Pipeline__c FROM Account WHERE Id IN :accIds];
+    update accsToLock; // High concurrency collision: UNABLE_TO_LOCK_ROW!
 }""",
        "hidden_risks": "System.DmlException: UNABLE_TO_LOCK_ROW: unable to obtain exclusive access to this record. High-concurrency operations on parent Accounts without ID-ordered batching or FOR UPDATE row-locking cause catastrophic transaction timeouts and rollback cascading across all carts.",
        "accept_as_is": {
            "success_rate": 0.35,
            "success_feedback": "Only a few reps checked out simultaneously today, so row lock contention didn't trigger timeouts, but peak quarter-end load will deadlock all carts.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "ROW LOCKING DEADLOCK: Quarter-end sales surge hit 120 concurrent checkouts! System.DmlException: UNABLE_TO_LOCK_ROW crashed all order submissions and rolled back $4.2M in enterprise deals!",
            "failure_health_delta": -30,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You denied the PR. Reps waited for nightly scheduled batch rollups, but checkout operations stayed 100% stable.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["for update", "order by id", "queueable", "platform event", "locking", "retry", "row lock", "deterministic"],
            "success_feedback": "HITL Success! The AI sorted parent Account IDs deterministically, added SOQL [SELECT Id FROM Account WHERE Id IN :accIds ORDER BY Id FOR UPDATE] to eliminate circular deadlocks, and decoupled heavy totals via Queueable Apex.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not specify deterministic lock sequencing or async rollups, leaving high-concurrency cart deadlocks! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg8_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Deterministic Id-Sorting & SOQL FOR UPDATE Row Locking",
                "description": "Sort parent Account IDs deterministically in ascending sequence before locking, query via 'SELECT Id FROM Account WHERE Id IN :accIds ORDER BY Id FOR UPDATE', and decouple heavy aggregations to Queueable Apex.",
                "benefit_feedback": "Architectural Solution Applied: Concurrency deadlock cycle eliminated; passed 200 concurrent user stress test with zero row lock timeouts.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg8_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Catch UNABLE_TO_LOCK_ROW with Synchronous Retry Loop",
                "description": "Wrap parent update in a try-catch for UNABLE_TO_LOCK_ROW with a synchronous 3-time retry counter.",
                "benefit_feedback": "Patchwork Fix Applied: Resolved minor transient lock blips, but under peak checkout volume the synchronous retries breached Apex CPU time limits! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg8_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Fire Independent @future Recalculation per Line Item",
                "description": "Dispatch a separate @future method for every OpportunityLineItem insert to update the parent account asynchronously.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Concurrent @future jobs attempted to lock the same parent account simultaneously, causing massive async deadlocks! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 9,
        "title": "The Apex CPU Time Limit Breach",
        "phase_name": "Inbound Webhook Parsing & Regex Engine",
        "story": "The AI implemented an inbound REST service in Apex (/services/apexrest/v1/webhook) to validate external JSON payloads. To extract nested identifiers, the AI wrote a complex regular expression with nested greedy quantifiers. When an ERP partner sends a 120KB payload with unescaped characters, the regex engine enters catastrophic backtracking, spinning until the 10,000ms synchronous Apex CPU limit is breached.",
        "ai_proposal_summary": "Engineered inbound REST webhook endpoint with flexible regular expression pattern matching for nested JSON payload sanitization.",
        "file_name": "force-app/main/default/classes/InboundWebhookRestService.cls",
        "code_diff": """--- a/force-app/main/default/classes/InboundWebhookRestService.cls
+++ b/force-app/main/default/classes/InboundWebhookRestService.cls
@@ -12,6 +12,10 @@ public with sharing class InboundWebhookRestService {
+        // AI Regex: Catastrophic backtracking on unexpected input
+        Pattern greedyPattern = Pattern.compile('^([a-zA-Z0-9_-]+)*@([a-zA-Z0-9_-]+)*$');
+        Matcher m = greedyPattern.matcher(rawJsonString);
+        Boolean isValid = m.matches(); // Freezes Apex thread for >10,000ms!
     }
 }""",
        "hidden_risks": "System.LimitException: Apex CPU time limit exceeded (10000ms). Synchronous Apex execution enforces a non-negotiable 10-second multi-tenant CPU ceiling. Infinite loops or catastrophic regex backtracking terminate the thread immediately without exception catch blocks.",
        "accept_as_is": {
            "success_rate": 0.35,
            "success_feedback": "Incoming test payloads were small (2KB), so the regex executed within 400ms today, but production payload sizes will freeze the CPU thread.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "CPU LIMIT BREACH: An inbound SAP telemetry batch triggered exponential regex backtracking! System.LimitException: Apex CPU time limit exceeded (10000ms) aborted the REST thread, failing 1,800 supplier shipments!",
            "failure_health_delta": -30,
            "failure_pulls": 2,
        },
        "deny_and_move_on": {
            "feedback": "You denied the PR. Inbound payloads were rejected temporarily, but org CPU limits stayed safely below governor thresholds.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["jsonparser", "cpu limit", "regex", "async", "deserializestrict", "streaming parser", "time limit", "json"],
            "success_feedback": "HITL Success! The AI eliminated the greedy regex, replaced it with JSON.createParser() streaming tokenization, and moved heavy processing to an asynchronous Queueable with a 60,000ms CPU ceiling.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not specify streaming JSON parsing or async offloading, leaving synchronous CPU timeouts active! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg9_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Streaming JSON.createParser() & Queueable Offloading",
                "description": "Replace catastrophic regex with low-memory JSON.createParser() streaming tokenization, immediately return HTTP 200 OK, and offload processing to an async Queueable with a 60,000ms CPU limit.",
                "benefit_feedback": "Architectural Solution Applied: Parsing CPU time slashed from 9,800ms down to 24ms per payload with zero timeout risk.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg9_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Pre-Truncate Inbound Payload String to 10,000 Characters",
                "description": "Truncate the raw JSON string before applying regex pattern matching to keep regex execution under the CPU time limit.",
                "benefit_feedback": "Patchwork Fix Applied: Avoided the CPU freeze, but truncated valid multi-line ERP payloads, corrupting 14% of incoming customer orders! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg9_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Nested Try-Catch Block Around Regex Evaluator",
                "description": "Wrap Pattern.matcher().matches() in try-catch (Exception e) blocks to handle CPU limits gracefully.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Apex CPU limit exceptions are uncatchable by try-catch blocks; the thread died instantly with an unhandled fatal error! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 10,
        "title": "The EventBus Infinite Recursive Storm",
        "phase_name": "Event-Driven Architecture & Platform Events",
        "story": "To synchronize inventory changes, the AI created a Platform Event trigger on Inventory_Event__e. Upon receiving an event, the trigger adjusts local stock and immediately publishes an updated Inventory_Event__e for downstream apps! Because the AI didn't include an originating source ID or replay idempotency filter, the trigger continuously triggers itself in an infinite publishing storm that drains the org's hourly event allocation in 90 seconds.",
        "ai_proposal_summary": "Implemented real-time bidirectional inventory synchronization using High-Volume Platform Event publishing inside subscriber triggers.",
        "file_name": "force-app/main/default/triggers/InventoryEventTrigger.trigger",
        "code_diff": """--- a/force-app/main/default/triggers/InventoryEventTrigger.trigger
+++ b/force-app/main/default/triggers/InventoryEventTrigger.trigger
@@ -5,6 +5,10 @@ trigger InventoryEventTrigger on Inventory_Event__e (after insert) {
+        // AI Auto-Echo: Publishes new event without source filtering or idempotency check
+        for (Inventory_Event__e ev : Trigger.new) {
+            EventBus.publish(new Inventory_Event__e(SKU__c = ev.SKU__c, Qty__c = ev.Qty__c - 1));
+        }
     }
 }""",
        "hidden_risks": "EventBus Limit Exhaustion & Runaway Recursion: Publishing events from within the same event's trigger subscriber without correlation IDs creates an infinite feedback loop that burns through the org's hourly publishing allocation and halts all enterprise streaming clients.",
        "accept_as_is": {
            "success_rate": 0.35,
            "success_feedback": "No external systems sent inventory updates today, so the echo loop wasn't tripped, but the first live event will trigger an infinite event storm.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "EVENTBUS BLOWOUT: Infinite echo loop published 250,000 events in 2 minutes! Org-wide hourly event publishing allocation reached 100%! Salesforce halted all streaming integrations enterprise-wide!",
            "failure_health_delta": -32,
            "failure_pulls": 3,
        },
        "deny_and_move_on": {
            "feedback": "You denied the event PR. Inventory was synced hourly using Batch Apex instead of real-time events, but the event bus remained 100% operational.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["idempotency", "correlation id", "eventbus", "recursion guard", "change data capture", "static set", "filter", "replayid"],
            "success_feedback": "HITL Success! The AI implemented a CorrelationId__c header, an in-memory recursion depth counter, and an idempotency cache to block self-published echo loops.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt did not establish idempotency checks or recursion filters, allowing runaway event loops to continue! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg10_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "UUID CorrelationId & In-Memory Recursion Circuit Breaker",
                "description": "Tag all events with an immutable CorrelationId__c header, maintain an in-memory processed UUID set, and enforce a static recursion depth guard to block self-published echo loops.",
                "benefit_feedback": "Architectural Solution Applied: Loop terminates cleanly on first echo detection with zero event bus allocation waste.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg10_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Static Boolean hasRun Flag Guard in Trigger",
                "description": "Place a static Boolean hasRun = false flag inside the trigger to exit if already executed in the current transaction.",
                "benefit_feedback": "Patchwork Fix Applied: Prevented immediate recursion in the initial batch, but static flags reset across subsequent asynchronous subscriber batches, letting downstream loops through! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg10_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "SOQL Query Against Inventory_Event__e Database Table",
                "description": "Add a SOQL query at the top of the trigger to query previous Inventory_Event__e records to check for duplicates.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Platform Events are streaming events and cannot be queried via SOQL! Threw sObject not queryable runtime error! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    },
    {
        "id": 11,
        "title": "The Plaintext Secret & Callout Leak",
        "phase_name": "Named Credentials, Security Review & Production Cut-Over",
        "story": "The final production cut-over is minutes away. To connect to the external Banking & Payment API, the AI hardcoded the live production API key and client secret directly in Apex HTTP callout headers (req.setHeader('Authorization', 'Bearer sk_live_prod_9924...')) and logged the entire HTTP request and response into custom debug logs viewable by anyone with setup read access!",
        "ai_proposal_summary": "Finalized Payment Gateway integration. Hardcoded authentication headers for immediate zero-config connectivity to live banking endpoints.",
        "file_name": "force-app/main/default/classes/BankingPaymentService.cls",
        "code_diff": """--- a/force-app/main/default/classes/BankingPaymentService.cls
+++ b/force-app/main/default/classes/BankingPaymentService.cls
@@ -15,7 +15,10 @@ public with sharing class BankingPaymentService {
-        // TODO: Configure Named Credential with External Credential Principal
+        HttpRequest req = new HttpRequest();
+        req.setEndpoint('https://api.securebank.com/v2/transactions');
+        req.setHeader('Authorization', 'Bearer sk_live_prod_9924810239103'); // Plaintext Secret!
+        System.debug('Payload: ' + req.getHeader('Authorization')); // Leaked to Debug Logs!
     }
 }""",
        "hidden_risks": "OWASP / Salesforce AppExchange Security Violation: Plaintext secrets in code and debug logs are vulnerable to repo scrapers, insider threats, and sandbox refresh exposure. Salesforce Security Review automatically rejects unencrypted credential headers, and compromised keys enable unauthorized fund disbursements.",
        "accept_as_is": {
            "success_rate": 0.35,
            "success_feedback": "The payment callout returned 200 OK during live smoke testing, but the live banking API key is now permanently indexed in sandbox git commit history and debug logs.",
            "success_health_delta": 5,
            "success_pulls": 0,
            "failure_feedback": "CRITICAL SECURITY COMPROMISE: Production banking API secret was scraped from sandbox debug logs! SecOps triggered an emergency killswitch, revoking keys and blocking all end-of-month payments across 14 subsidiaries!",
            "failure_health_delta": -35,
            "failure_pulls": 3,
        },
        "deny_and_move_on": {
            "feedback": "You refused to deploy plaintext keys. The payment gateway cut-over was delayed 2 days, but company bank accounts and compliance credentials remained 100% secure.",
            "health_delta": -10,
            "pulls": 1,
        },
        "custom_prompt": {
            "keywords": ["named credential", "external credential", "callout:", "vault", "mask", "no hardcoded secrets", "certificate", "credential"],
            "success_feedback": "HITL Success! The AI eliminated hardcoded keys: it configured a Salesforce Named Credential (callout:BankingApi) backed by an External Credential Principal, and stripped authorization headers from all debug logs.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "failure_feedback": "Vague Guidance Flaw: The prompt failed to require platform Named Credentials or secret masking, leaving production secrets exposed in source logs! (-12% Health, 1 Block pulled, +1 Tech Debt).",
            "failure_health_delta": -12,
            "failure_pulls": 1,
        },
        "ai_suggestions": [
            {
                "id": "stg11_opt",
                "tier": "optimal",
                "accuracy": "80% Match",
                "title": "Salesforce Named Credentials & External Credential Principal Vault",
                "description": "Store live secrets in Salesforce Named Credential vaults, authenticate via 'callout:BankingApi' endpoint prefix with zero code exposure, and mask authorization headers from logs.",
                "benefit_feedback": "Architectural Solution Applied: 100% compliance with OWASP and Salesforce Trust credential standards; zero plaintext keys in git or logs.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "stg11_patch",
                "tier": "patchwork",
                "accuracy": "50% Match",
                "title": "Base64 Obfuscation in Protected Custom Setting",
                "description": "Store the secret Base64-encoded inside a Protected Custom Setting and decode it dynamically before setting the HTTP header.",
                "benefit_feedback": "Patchwork Fix Applied: Removed secret from raw Apex code, but Base64 is easily decodable and the key still printed in plaintext in System.debug() logs! (1 Block pulled)",
                "health_delta": 4,
                "pulls": 1
            },
            {
                "id": "stg11_flawed",
                "tier": "flawed",
                "accuracy": "20% Anti-Pattern",
                "title": "Crypto.encryptWithManagedIV with Hardcoded Class Key",
                "description": "Encrypt the secret with Crypto.encryptWithManagedIV using an AES256 key defined as a static constant within the same class.",
                "benefit_feedback": "Flawed Anti-Pattern Applied: Storing the decryption key in the same file failed Salesforce Security Review immediately! (-10% Health, 2 Blocks pulled, +1 Debt)",
                "health_delta": -10,
                "pulls": 2
            }
        ]
    }
]

# Provide backward-compatibility alias so any reference to suggest_change_rules still resolves
for stage in STAGES:
    if "ai_suggestions" in stage:
        stage["suggest_change_rules"] = stage["ai_suggestions"]
