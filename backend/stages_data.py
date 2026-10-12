"""
Salesforce-Specific SDLC Stages and Scenario Data for HITL Jenga: AI-Paced Development
7 sequential stages representing real-world Salesforce development dilemmas (Apex, SOQL, LWC, Governors, Security, Async, DevOps).
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
            "success_health_delta": 0,
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
            "keywords": ["bulkify", "map", "set", "governor", "soql", "dml", "loop", "collection", "in-memory", "trigger.new"],
            "success_feedback": "HITL Success! The AI agent acknowledged the governor limits: it extracted parent IDs into a Set, ran a single bulkified SOQL query outside the loop, mapped contacts in-memory, and executed one bulk DML update.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "partial_feedback": "Your prompt asked to fix SOQL in the loop, but forgot about DML inside the inner loop, leaving partial governor risk.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_apex_bulkification_pattern",
                "title": "Enforce Enterprise Bulkified Apex Trigger Framework & Map In-Memory Joins",
                "description": "Ban all SOQL queries and DML statements inside loops; mandate Map<Id, SObject> collection patterns with single bulk DML operations.",
                "benefit_feedback": "Bulkification Guardrail Applied: Code refactored into zero-loop SOQL pattern. Passed 10,000 record stress test with only 1 SOQL query consumed.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_pmd_code_analyzer",
                "title": "Automated Salesforce Code Analyzer (PMD) Rule: ApexSOQLInjection & AvoidSoqlInLoops",
                "description": "Block CI/CD deployment on any PMD violations for AvoidSoqlInLoops or DmlInLoops.",
                "benefit_feedback": "PMD Static Analysis Guardrail Applied: CI gate rejected loop query before reaching staging.",
                "health_delta": 7,
                "pulls": 0
            },
            {
                "id": "rule_trigger_handler_dispatcher",
                "title": "Standardize on fflib / Apex Trigger Handler Architecture",
                "description": "Enforce separation of concerns using Domain and Selector layers for all database operations.",
                "benefit_feedback": "Architecture Guardrail Applied: Standardized Selector layer guarantees query bulkification across the org.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "keywords": ["with sharing", "stripinaccessible", "security.stripinaccessible", "fls", "escapesinglequotes", "bind variable", "accessible", "isaccessible"],
            "success_feedback": "HITL Success! The AI restored 'with sharing', replaced string concatenation with bound variables (:searchKey), and implemented Security.stripInaccessible(AccessType.READABLE, records) to enforce Field-Level Security.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "partial_feedback": "Your prompt changed class to 'with sharing', but forgot to sanitize dynamic SOQL injection, leaving a partial security gap.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_strip_inaccessible",
                "title": "Enforce 'with sharing' & Security.stripInaccessible(AccessType.READABLE, ...) Mandate",
                "description": "Enforce strict Field-Level Security stripping and bound SOQL variables for all @AuraEnabled methods.",
                "benefit_feedback": "Security Guardrail Applied: Automatic FLS stripping sanitized sensitive fields and eliminated SOQL injection.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_user_mode_soql",
                "title": "Mandate Apex WITH USER_MODE Database Operations",
                "description": "Enforce Salesforce Spring/Summer standard 'WITH USER_MODE' query clause to automatically enforce sharing and FLS natively.",
                "benefit_feedback": "Platform Guardrail Applied: Native USER_MODE database access guarantees zero privilege escalation.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_graph_engine_dfa",
                "title": "Execute Salesforce Code Analyzer Graph Engine Data-Flow Analysis (DFA)",
                "description": "Trace tainted user input sources to database sink endpoints in automated CI/CD scans.",
                "benefit_feedback": "DFA Guardrail Applied: Graph Engine flagged the tainted query input and blocked deployment before merge.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "partial_feedback": "Your prompt mentioned @future, but did not handle passing complex sObject parameters, resulting in serialization errors.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_queueable_decoupling",
                "title": "Decouple Setup Object DML via Queueable Apex Job with Finalizer",
                "description": "Execute User and PermissionSet DML in an asynchronous Queueable transaction context to eliminate Mixed DML.",
                "benefit_feedback": "Queueable Guardrail Applied: Isolated transaction contexts guarantee 100% compliance with Salesforce DML concurrency rules.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_platform_event_onboarding",
                "title": "Publish Event-Driven Architecture (Platform Events) for Identity Provisioning",
                "description": "Publish a High-Volume Platform Event (New_Hire_Event__e) subscribed to by an automated process.",
                "benefit_feedback": "Event-Driven Guardrail Applied: Resilient decoupled architecture prevents locks and failures.",
                "health_delta": 7,
                "pulls": 0
            },
            {
                "id": "rule_system_runas_unit_test",
                "title": "Require System.runAs() Test Isolation on All Provisioning Suites",
                "description": "Mandate unit tests validating execution as different user personas with separate DML blocks.",
                "benefit_feedback": "Testing Guardrail Applied: Comprehensive persona suites ensure zero runtime privilege collisions.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "partial_feedback": "Your prompt mentioned Shadow DOM, but left hardcoded string field names in place, risking schema renaming regressions.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_schema_import_policy",
                "title": "Mandate @salesforce/schema Imports & Shadow DOM Template Isolation",
                "description": "Strictly prohibit hardcoded SObject/field string names; enforce this.template scoping on all DOM interactions.",
                "benefit_feedback": "LWC Standard Guardrail Applied: 100% schema dependency integrity and clean LWS compliance verified.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_lightning_data_service",
                "title": "Standardize on Lightning Data Service (LDS) Wire Adapters & getRecord",
                "description": "Eliminate custom imperative Apex where standard reactive LDS wire adapters manage cache and updates.",
                "benefit_feedback": "LDS Guardrail Applied: Automatic client-side caching and zero server-side Apex roundtrips.",
                "health_delta": 7,
                "pulls": 0
            },
            {
                "id": "rule_eslint_lwc_bundle",
                "title": "Enforce Salesforce ESLint LWC Plugin in Pre-Commit Hooks",
                "description": "Run @salesforce/eslint-plugin-lwc with rules: no-document-query and no-inner-html.",
                "benefit_feedback": "Linter Guardrail Applied: Prohibited DOM access caught immediately during commit stage.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "keywords": ["batch apex", "chunk", "governor", "limits.getlimitqueueablejobs", "finalizer", "queueable", "consolidate", "throttle"],
            "success_feedback": "HITL Success! The AI replaced runaway single-record Queueables with a chunked Batchable Apex job (Database.Batchable) processing 200 records per scope with automatic retry throttling.",
            "success_health_delta": 8,
            "success_pulls": 0,
            "partial_feedback": "Your prompt asked to reduce queueables, but the AI simply added an arbitrary sleep loop, which is unsupported in Apex and wastes CPU time.",
            "partial_health_delta": -3,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_batch_apex_chunking",
                "title": "Migrate to Database.Batchable<sObject> with 200-Record Scope Chunking",
                "description": "Standardize high-volume data sync on Batch Apex with built-in iterator chunking and automated governor reset per batch.",
                "benefit_feedback": "Batchable Guardrail Applied: Reduced async consumption by 99.5% with rock-solid execution bounds.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_queueable_finalizer",
                "title": "Enforce System.Finalizer & Limits.getQueueableJobs() Execution Throttle",
                "description": "Block chaining if remaining daily async executions fall below 20% threshold; implement automated recovery.",
                "benefit_feedback": "Finalizer Guardrail Applied: Guardrail throttled sync jobs safely before breaching org-wide limit.",
                "health_delta": 7,
                "pulls": 0
            },
            {
                "id": "rule_platform_event_buffering",
                "title": "Buffer Inbound Webhooks in Platform Event Stream with ReplayId",
                "description": "Decouple external ingestion from immediate Apex execution using durable event logs.",
                "benefit_feedback": "Event Streaming Guardrail Applied: High-throughput ingestion with zero risk of governor starvation.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "keywords": ["schema.sobjecttype", "developername", "custom metadata", "cmd", "getrecordtypeinfosbydevelopername", "no hardcoded ids"],
            "success_feedback": "HITL Success! The AI eliminated all hardcoded IDs: it retrieved Record Types dynamically using SObjectType.Lead.getRecordTypeInfosByDeveloperName() and looked up Queue IDs via Custom Metadata Types (CMDT).",
            "success_health_delta": 8,
            "success_pulls": 0,
            "partial_feedback": "Your prompt mentioned dynamic record types, but left the hardcoded queue owner ID in place.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_dynamic_schema_record_types",
                "title": "Mandate SObjectType.getRecordTypeInfosByDeveloperName() Dynamic Lookups",
                "description": "Strictly ban all hardcoded Salesforce IDs; enforce in-memory Describe SObject Result caching.",
                "benefit_feedback": "Describe Schema Guardrail Applied: Dynamic schema resolution runs in-memory with zero SOQL queries consumed.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_custom_metadata_routing",
                "title": "Standardize Routing Configurations on Custom Metadata Types (CMDT)",
                "description": "Store environment mappings in Custom Metadata so they deploy seamlessly with code.",
                "benefit_feedback": "Custom Metadata Guardrail Applied: Declarative configuration deployed with 100% environment parity.",
                "health_delta": 7,
                "pulls": 0
            },
            {
                "id": "rule_sfdx_scanner_hardcoded_ids",
                "title": "Enforce Salesforce Code Analyzer (sf scanner) Rule: AvoidHardcodingIds",
                "description": "Run automated regex pattern scanner in CI/CD pipeline to reject any commit containing 15/18-character IDs.",
                "benefit_feedback": "Scanner Guardrail Applied: Automated CI scanner identified the hardcoded IDs and rejected the pull request.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "success_health_delta": 10,
            "success_pulls": 0,
            "partial_feedback": "Your prompt required tests, but forgot to use Quick Deploy with the validated job ID, making the cut-over take 45 minutes longer than necessary.",
            "partial_health_delta": 0,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_quick_deploy_pipeline",
                "title": "Mandate Quick Deploy Pattern (Pre-Validated Check-Only Staging Job ID)",
                "description": "Pre-validate deployment artifacts in staging with RunLocalTests; execute atomic Quick Deploy in Production in under 30 seconds.",
                "benefit_feedback": "Quick Deploy Guardrail Applied: 100% coverage verified in advance. Zero downtime production cut-over completed smoothly.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_test_coverage_gate_85",
                "title": "Enforce Strict 85% Code Coverage Gate & Automated Rollback Watchdog",
                "description": "Exceed standard 75% requirement; mandate positive, negative, and bulk test assertions for all Apex triggers.",
                "benefit_feedback": "Quality Gate Guardrail Applied: Robust test assertions ensure zero regressions across all business units.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_freeze_friday_deployments",
                "title": "Salesforce Production Freeze Window: Block Deployments Past 2:00 PM on Fridays",
                "description": "Enforce operational engineering governance: all production releases require Monday morning staging deployment sign-off.",
                "benefit_feedback": "Operational Governance Applied: Release staged cleanly for low-risk Monday rollout with full engineering support.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "partial_feedback": "Your prompt mentioned row locks, but didn't enforce deterministic ID sorting, leaving mutual deadlock vulnerabilities.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_deterministic_id_locking",
                "title": "Enforce Deterministic Id-Sorting & SOQL FOR UPDATE Locking Strategy",
                "description": "Lock parent records in ascending ID sequence to eliminate mutual cycle deadlocks across concurrent threads.",
                "benefit_feedback": "Locking Guardrail Applied: Deterministic lock sequencing passed 250 concurrent worker load test with 0 lock exceptions.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_queueable_rollup_decoupling",
                "title": "Decouple Heavy Rollups via Asynchronous Queueable Apex with Delay",
                "description": "Isolate parent balance recalculation from the synchronous checkout thread to eliminate UI latency.",
                "benefit_feedback": "Async Guardrail Applied: Checkout thread latency dropped by 82% with zero row lock contention.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_lock_retry_framework",
                "title": "Enforce Enterprise Lock Exception Exponential Backoff & Retry",
                "description": "Implement catch block for UNABLE_TO_LOCK_ROW with automated exponential backoff retry handler.",
                "benefit_feedback": "Resilience Guardrail Applied: Automated retry transparently recovered 100% of temporary lock contentions.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "partial_feedback": "Your prompt simplified the regex, but left the large payload in synchronous execution context, risking edge-case CPU spikes.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_streaming_json_parser",
                "title": "Mandate Streaming JSONParser & System.JSON.deserializeStrict() Schema Model",
                "description": "Parse large payloads with low-memory streaming iterator; prohibit regex-based JSON extraction.",
                "benefit_feedback": "Parser Guardrail Applied: Webhook CPU consumption dropped from 9,400ms to 45ms per payload.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_async_webhook_processing",
                "title": "Offload Heavy Webhook Processing to Asynchronous Context (60-Second CPU Ceiling)",
                "description": "Immediately return 200 OK to caller and enqueue processing in Queueable Apex with 60,000ms CPU limit.",
                "benefit_feedback": "Async Guardrail Applied: 6x higher CPU threshold accommodates high-density enterprise payloads.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_pmd_complex_regex",
                "title": "Salesforce Code Analyzer Rule: AvoidComplexRegexInApex",
                "description": "Block deployment on any regex patterns containing nested quantifiers or unanchored lookaheads.",
                "benefit_feedback": "Linter Guardrail Applied: Static scanner identified vulnerable regex syntax prior to deployment.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "partial_feedback": "Your prompt added a static boolean flag, but static variables reset across asynchronous subscriber batches, leaving a partial recursion risk.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_event_correlation_idempotency",
                "title": "Enforce UUID CorrelationId & Idempotent Deduplication Cache on All Events",
                "description": "Tag each event with SourceAppId and CorrelationId; reject duplicate events within 24-hour cache.",
                "benefit_feedback": "Idempotency Guardrail Applied: Self-published echo events identified and discarded with 0 governor impact.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_event_recursion_guard",
                "title": "Mandate Static Recursion Depth Guard & Event Source Filtering",
                "description": "Strictly prevent publishing the same event type from within its own after-insert subscriber trigger.",
                "benefit_feedback": "Recursion Guardrail Applied: Hard circuit breaker terminated loop before publishing second event.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_cdc_filter_expressions",
                "title": "Migrate Inbound State Changes to Change Data Capture (CDC) with Filter Expressions",
                "description": "Use declarative CDC channel filtering to process only genuine external field modifications.",
                "benefit_feedback": "CDC Guardrail Applied: Declarative channel filter eliminated need for custom trigger publishers.",
                "health_delta": 6,
                "pulls": 0
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
            "success_health_delta": 0,
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
            "success_health_delta": 10,
            "success_pulls": 0,
            "partial_feedback": "Your prompt mentioned Named Credentials, but left raw authorization tokens printed in System.debug() lines.",
            "partial_health_delta": -2,
            "partial_pulls": 1,
        },
        "suggest_change_rules": [
            {
                "id": "rule_named_credentials_vault",
                "title": "Enforce Salesforce Named Credentials & External Credential Vault Architecture",
                "description": "Store secrets securely in platform key vaults; authenticate via callout: endpoint prefix with zero code exposure.",
                "benefit_feedback": "Named Credential Guardrail Applied: 100% compliance with Salesforce Trust and OWASP credential standards.",
                "health_delta": 10,
                "pulls": 0
            },
            {
                "id": "rule_callout_header_masking",
                "title": "Mandate Apex HTTP Callout Header Masking & Prohibit Raw Authorization Logging",
                "description": "Automatically redact Bearer tokens and signature headers before writing to debug logs or error sObjects.",
                "benefit_feedback": "Logging Guardrail Applied: Sensitive tokens masked in all server execution logs.",
                "health_delta": 8,
                "pulls": 0
            },
            {
                "id": "rule_secret_scanner_ci",
                "title": "Enforce Pre-Deployment Salesforce Code Analyzer Secret Scanner Rule: AvoidHardcodedSecrets",
                "description": "Run automated regex entropy scanner on all commit diffs to block API keys, private keys, and secrets.",
                "benefit_feedback": "Scanner Guardrail Applied: Automated CI gate detected the token and prevented repo commit.",
                "health_delta": 6,
                "pulls": 0
            }
        ]
    }
]
