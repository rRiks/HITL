import random
from typing import Dict, Any, List, Optional

class CandidateRepository:
    """
    CandidateRepository (Single Responsibility: Candidate Data Access)
    Stores the 6-variant candidate proposal pool per stage and handles stochastic sampling.
    """
    def __init__(self, pool_data: Optional[Dict[int, List[Dict[str, Any]]]] = None):
        self._pools = pool_data if pool_data is not None else DEFAULT_CANDIDATE_POOLS

    def get_candidates(self, stage_id: int) -> List[Dict[str, Any]]:
        return self._pools.get(stage_id, [])

    def sample_candidate(self, stage_id: int) -> Dict[str, Any]:
        """Samples a proposal with replacement (stochastic re-proposing permitted)."""
        candidates = self._pools.get(stage_id, [])
        if not candidates:
            return {
                "id": f"s{stage_id}_default",
                "label": "AI Proposed Patch",
                "description": "Standard AI-generated pull request.",
                "code_diff": "--- a/Code.cls\n+++ b/Code.cls\n@@ ... @@\n+ // AI patch",
                "hidden_risk": 0.50,
            }
        chosen = random.choice(candidates)
        # Return a copy to ensure immutability
        return dict(chosen)

    def get_candidate_by_id(self, stage_id: int, candidate_id: str) -> Optional[Dict[str, Any]]:
        candidates = self._pools.get(stage_id, [])
        for c in candidates:
            if c["id"] == candidate_id:
                return dict(c)
        return None

    def get_candidate_hidden_risk(self, stage_id: int, candidate_id: str) -> float:
        """Internal lookup for the candidate's secret failure risk (0.05 to 0.85)."""
        c = self.get_candidate_by_id(stage_id, candidate_id)
        if c:
            return float(c.get("hidden_risk", 0.50))
        return 0.50


# -------------------------------------------------------------
# 6 Distinct Candidates for All 11 Stages (Hidden Risk strictly internal)
# -------------------------------------------------------------
DEFAULT_CANDIDATE_POOLS: Dict[int, List[Dict[str, Any]]] = {
    # Stage 1: The Governor Limit Trap (SOQL / DML in Loop)
    1: [
        {
            "id": "s1_c1",
            "label": "Direct SOQL Query inside Trigger.new Loop",
            "description": "Iterates each Contact and runs inline SOQL query to fetch parent Account.",
            "code_diff": "--- a/ContactTrigger.trigger\n+++ b/ContactTrigger.trigger\n@@ -10,3 +10,5 @@\n+ for (Contact c : Trigger.new) {\n+     Account acc = [SELECT Id, Tier__c FROM Account WHERE Id = :c.AccountId]; // SOQL 101!\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s1_c2",
            "label": "Try-Catch Loop Wrapper with Governor Limit Check",
            "description": "Wraps inline SOQL with Limits.getQueries() check, silently breaking on 99.",
            "code_diff": "--- a/ContactTrigger.trigger\n+++ b/ContactTrigger.trigger\n@@ -10,3 +10,6 @@\n+ for (Contact c : Trigger.new) {\n+     if (Limits.getQueries() < 99) {\n+         Account acc = [SELECT Id FROM Account WHERE Id = :c.AccountId];\n+     }\n+ }",
            "hidden_risk": 0.65,
        },
        {
            "id": "s1_c3",
            "label": "Future Async Method Query Dispatch",
            "description": "Delegates each Contact query into an individual @future async method.",
            "code_diff": "--- a/ContactService.cls\n+++ b/ContactService.cls\n@@ -5,3 +5,6 @@\n+ for (Contact c : contacts) {\n+     ContactAsync.fetchAccountAsync(c.AccountId);\n+ }",
            "hidden_risk": 0.50,
        },
        {
            "id": "s1_c4",
            "label": "Basic List Query without Map Indexing",
            "description": "Queries all Accounts in one SOQL but uses nested loop linear search to match IDs.",
            "code_diff": "--- a/ContactTrigger.trigger\n+++ b/ContactTrigger.trigger\n@@ -10,3 +10,8 @@\n+ Set<Id> accIds = new Set<Id>();\n+ for (Contact c : Trigger.new) accIds.add(c.AccountId);\n+ List<Account> accs = [SELECT Id, Tier__c FROM Account WHERE Id IN :accIds];\n+ // Linear matching in O(N^2) CPU time",
            "hidden_risk": 0.35,
        },
        {
            "id": "s1_c5",
            "label": "Bulkified Map<Id, Account> Schema Pattern",
            "description": "Collects Account IDs into Set, queries single bulk SOQL into Map<Id, Account>.",
            "code_diff": "--- a/ContactService.cls\n+++ b/ContactService.cls\n@@ -10,3 +10,7 @@\n+ Set<Id> accIds = new Set<Id>();\n+ for (Contact c : contacts) if (c.AccountId != null) accIds.add(c.AccountId);\n+ Map<Id, Account> accMap = new Map<Id, Account>([SELECT Id, Tier__c FROM Account WHERE Id IN :accIds]);\n+ for (Contact c : contacts) { Account a = accMap.get(c.AccountId); }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s1_c6",
            "label": "Enterprise Selector Layer + Bulk Map Cache",
            "description": "Encapsulates bulk query inside AccountsSelector with null-safe map lookup.",
            "code_diff": "--- a/ContactService.cls\n+++ b/ContactService.cls\n@@ -10,3 +10,5 @@\n+ Set<Id> accIds = Pluck.ids(contacts, Contact.AccountId);\n+ Map<Id, Account> accMap = AccountsSelector.newInstance().selectById(accIds);\n+ ContactDomain.enrichTiers(contacts, accMap);",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 2: The Security & FLS Bypass
    2: [
        {
            "id": "s2_c1",
            "label": "Without Sharing with Raw Field DML",
            "description": "Declares class 'without sharing' and updates fields without FLS verification.",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,5 @@\n+ public without sharing class PortalService {\n+     public static void updateSSN(Id cId, String ssn) { update new Contact(Id=cId, SSN__c=ssn); }\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s2_c2",
            "label": "Simple Schema isAccessible Check on Object Only",
            "description": "Checks Schema.sObjectType.Contact.isAccessible() but ignores field-level security.",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -5,3 +5,5 @@\n+ if (Schema.sObjectType.Contact.isAccessible()) {\n+     update new Contact(Id=cId, SSN__c=ssn); // SSN field still bypassed!\n+ }",
            "hidden_risk": 0.65,
        },
        {
            "id": "s2_c3",
            "label": "Dynamic SOQL String Concatenation with Escaping",
            "description": "Uses String.escapeSingleQuotes() but omits user mode enforcement.",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -5,3 +5,5 @@\n+ String query = 'SELECT Id, SSN__c FROM Contact WHERE Id = \\'' + String.escapeSingleQuotes(cId) + '\\'';\n+ return Database.query(query);",
            "hidden_risk": 0.50,
        },
        {
            "id": "s2_c4",
            "label": "Inherited Sharing with Manual Field Describe Checks",
            "description": "Uses inherited sharing and iterates describe field tokens manually.",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,6 @@\n+ public inherited sharing class PortalService {\n+     if (Schema.sObjectType.Contact.fields.SSN__c.isUpdateable()) update con;\n+ }",
            "hidden_risk": 0.30,
        },
        {
            "id": "s2_c5",
            "label": "Security.stripInaccessible Pattern",
            "description": "Enforces 'with sharing' and strips unauthorized fields before DML via stripInaccessible.",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,6 @@\n+ public with sharing class PortalService {\n+     SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, contacts);\n+     update decision.getRecords();\n+ }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s2_c6",
            "label": "Apex USER_MODE Native Database Operation",
            "description": "Uses standard Apex WITH USER_MODE queries and Database.insert(record, true, AccessLevel.USER_MODE).",
            "code_diff": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,5 @@\n+ public with sharing class PortalService {\n+     List<Contact> records = [SELECT Id, Name FROM Contact WHERE Id = :conId WITH USER_MODE];\n+     Database.update(records, AccessLevel.USER_MODE);\n+ }",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 3: The Mixed DML Concurrency Trap
    3: [
        {
            "id": "s3_c1",
            "label": "Synchronous Contact and User Insert",
            "description": "Inserts Contact (Non-Setup) and User (Setup) sequentially in the same block.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,6 @@\n+ insert new Contact(LastName = 'Smith');\n+ insert new User(Username = 'smith@org.com'); // FATAL: MIXED_DML_OPERATION!\n+ insert new PermissionSetAssignment(AssigneeId = u.Id);",
            "hidden_risk": 0.85,
        },
        {
            "id": "s3_c2",
            "label": "Separate Try-Catch Blocks for Setup and Non-Setup",
            "description": "Wraps each insert in try-catch, which does not prevent Mixed DML in transaction.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,7 @@\n+ try { insert new Contact(LastName = 'Smith'); } catch (Exception e) {}\n+ try { insert new User(Username = 'smith@org.com'); } catch (Exception e) {} // Still triggers Mixed DML!",
            "hidden_risk": 0.70,
        },
        {
            "id": "s3_c3",
            "label": "Synchronous System.runAs() Mock in Production",
            "description": "Attempts to call System.runAs() outside of @isTest context.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ System.runAs(adminUser) { insert usr; } // Fails: runAs only allowed in test!",
            "hidden_risk": 0.55,
        },
        {
            "id": "s3_c4",
            "label": "@future(callout=false) User Provisioning",
            "description": "Isolates User creation into @future method with serialized parameter strings.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ UserProvisionerFuture.createUser(con.Id, 'smith@org.com');",
            "hidden_risk": 0.30,
        },
        {
            "id": "s3_c5",
            "label": "Queueable Async Transaction Separation",
            "description": "Executes Contact insert synchronously and enqueues Queueable job for User setup.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ System.enqueueJob(new ProvisionUserQueueable(con.Id, 'smith@org.com'));",
            "hidden_risk": 0.15,
        },
        {
            "id": "s3_c6",
            "label": "Platform Event Decoupled Onboarding Architecture",
            "description": "Publishes UserOnboarding__e platform event, decoupling setup DML into async event trigger.",
            "code_diff": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ EventBus.publish(new UserOnboarding__e(ContactId__c = con.Id)); // Perfect transaction isolation",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 4: The Brittle LWC & Shadow DOM Break
    4: [
        {
            "id": "s4_c1",
            "label": "Direct document.querySelector in renderedCallback",
            "description": "Searches global document tree for input element inside Salesforce Lightning container.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -5,3 +5,5 @@\n+ renderedCallback() {\n+     document.querySelector('lightning-input').value = 100; // Blocked by LWS!\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s4_c2",
            "label": "window.postMessage Cross-Component Communication",
            "description": "Bypasses Lightning Message Service using untrusted window.addEventListener message listener.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -10,3 +10,5 @@\n+ window.postMessage({ type: 'UPDATE_QUOTE', val: 100 }, '*');",
            "hidden_risk": 0.65,
        },
        {
            "id": "s4_c3",
            "label": "Hardcoded Schema String Paths",
            "description": "References sObject field strings directly without compile-time schema imports.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -5,3 +5,5 @@\n+ const field = 'Account.Tier_Level__c'; // Runtime typo breaks packaging!",
            "hidden_risk": 0.45,
        },
        {
            "id": "s4_c4",
            "label": "this.template.querySelector with Scoped CSS",
            "description": "Correctly scopes querySelector inside component template but relies on manual DOM timing.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -5,3 +5,5 @@\n+ const input = this.template.querySelector('lightning-input');\n+ if (input) input.value = 100;",
            "hidden_risk": 0.30,
        },
        {
            "id": "s4_c5",
            "label": "Compile-time @salesforce/schema + Two-Way Binding",
            "description": "Imports field tokens statically and uses reactive template bindings instead of manual DOM queries.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -1,3 +1,6 @@\n+ import TIER_FIELD from '@salesforce/schema/Account.Tier__c';\n+ export default class QuoteBuilder extends LightningElement {\n+     @api tierField = TIER_FIELD;\n+ }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s4_c6",
            "label": "Lightning Data Service + Lightning Message Service (LMS)",
            "description": "Uses getRecord wire adapter with message channel communication and zero manual DOM manipulation.",
            "code_diff": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -1,3 +1,6 @@\n+ import { wire } from 'lwc';\n+ import { getRecord } from 'lightning/uiRecordApi';\n+ import { publish, MessageContext } from 'lightning/messageService';\n+ @wire(getRecord, { recordId: '$recordId', fields: [TIER_FIELD] }) record;",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 5: The Async Queueable Storm
    5: [
        {
            "id": "s5_c1",
            "label": "Direct HTTP Callouts inside Trigger Execution",
            "description": "Removes Queueable and invokes external ERP sync directly in after insert trigger.",
            "code_diff": "--- a/LeadTrigger.trigger\n+++ b/LeadTrigger.trigger\n@@ -5,3 +5,6 @@\n+ for (Lead l : Trigger.new) {\n+     Http h = new Http();\n+     h.send(new HttpRequest()); // CalloutException in trigger!\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s5_c2",
            "label": "Iterative System.enqueueJob Loop",
            "description": "Enqueues a separate Queueable job for every individual lead record.",
            "code_diff": "--- a/LeadService.cls\n+++ b/LeadService.cls\n@@ -10,3 +10,6 @@\n+ for (Lead l : leads) {\n+     System.enqueueJob(new SyncQueueable(l.Id)); // Exceeds limit of 50 jobs!\n+ }",
            "hidden_risk": 0.70,
        },
        {
            "id": "s5_c3",
            "label": "@future(callout=true) Bulk Payload Dispatch",
            "description": "Bundles lead IDs into a future callout method without finalizer error handling.",
            "code_diff": "--- a/LeadService.cls\n+++ b/LeadService.cls\n@@ -10,3 +10,5 @@\n+ @future(callout=true)\n+ public static void syncLeadsAsync(List<Id> ids) { ... }",
            "hidden_risk": 0.50,
        },
        {
            "id": "s5_c4",
            "label": "Queueable Chaining with Limits Protection",
            "description": "Chunks records in memory and chains next Queueable when Limits.getQueueableJobs() permits.",
            "code_diff": "--- a/LeadQueueable.cls\n+++ b/LeadQueueable.cls\n@@ -10,3 +10,6 @@\n+ if (!remaining.isEmpty() && Limits.getQueueableJobs() < 1) {\n+     System.enqueueJob(new LeadQueueable(remaining));\n+ }",
            "hidden_risk": 0.30,
        },
        {
            "id": "s5_c5",
            "label": "Database.Batchable Chunking (200 records)",
            "description": "Refactors into Database.Batchable<sObject> processing 200 records per scope with automatic throttling.",
            "code_diff": "--- a/LeadBatch.cls\n+++ b/LeadBatch.cls\n@@ -1,3 +1,6 @@\n+ public class LeadBatch implements Database.Batchable<sObject>, Database.AllowsCallouts {\n+     public Database.QueryLocator start(Database.BatchableContext bc) { ... }\n+     public void execute(Database.BatchableContext bc, List<Lead> scope) { ... }\n+ }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s5_c6",
            "label": "Batchable Apex with Database.Stateful + BatchApexErrorEvent",
            "description": "Enterprise batch job tracking cumulative errors with platform event error reporting and safe retries.",
            "code_diff": "--- a/LeadBatch.cls\n+++ b/LeadBatch.cls\n@@ -1,3 +1,6 @@\n+ public class LeadBatch implements Database.Batchable<sObject>, Database.Stateful, Database.RaisesPlatformEvents {\n+     public Integer totalErrors = 0;\n+     // Full retry throttling with zero governor vulnerability\n+ }",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 6: The Hardcoded ID & Deprecated Namespace
    6: [
        {
            "id": "s6_c1",
            "label": "Hardcoded 18-Character RecordType & Profile IDs",
            "description": "Hardcodes record type ID '0125e000000ABC1' and profile ID directly in code.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -8,3 +8,5 @@\n+ if (lead.RecordTypeId == '0125e000000ABC1') { // Breaks in sandbox/prod!\n+     lead.OwnerId = '0055e000000XYZ9';\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s6_c2",
            "label": "Hardcoded Packaging Namespace Prefix in Dynamic SOQL",
            "description": "Hardcodes package namespace 'c__' prefix across dynamic describe queries.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,5 @@\n+ String query = 'SELECT Id, c__CustomField__c FROM c__Routing__c'; // Breaks if unpacked!",
            "hidden_risk": 0.65,
        },
        {
            "id": "s6_c3",
            "label": "SOQL Query on RecordType Object per Request",
            "description": "Executes SOQL on RecordType object dynamically instead of schema describe cache.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,5 @@\n+ RecordType rt = [SELECT Id FROM RecordType WHERE DeveloperName = 'Partner' LIMIT 1];",
            "hidden_risk": 0.50,
        },
        {
            "id": "s6_c4",
            "label": "Schema Describe Cache with DeveloperName Lookup",
            "description": "Uses Schema.SObjectType.Lead.getRecordTypeInfosByDeveloperName() without dynamic schema tokens.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,5 @@\n+ Id rtId = Schema.SObjectType.Lead.getRecordTypeInfosByDeveloperName().get('Partner').getRecordTypeId();",
            "hidden_risk": 0.30,
        },
        {
            "id": "s6_c5",
            "label": "Custom Metadata Type (CMDT) Org-Agnostic Mapping",
            "description": "Stores routing IDs and queues in Custom Metadata with zero hardcoded references.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,5 @@\n+ Lead_Routing_Rule__mdt rule = Lead_Routing_Rule__mdt.getInstance('Partner_Lead');\n+ Id rtId = Schema.SObjectType.Lead.getRecordTypeInfosByDeveloperName().get(rule.Record_Type__c).getRecordTypeId();",
            "hidden_risk": 0.15,
        },
        {
            "id": "s6_c6",
            "label": "Dynamic Schema Tokens with Namespace Agnostic Utility",
            "description": "Complete org portability using Schema.describeSObjects() and CMDT with dynamic namespace stripping.",
            "code_diff": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,6 @@\n+ String ns = AppUtils.getNamespacePrefix();\n+ Id rtId = SchemaUtils.getRecordTypeId(Lead.SObjectType, 'Partner');\n+ RoutingConfig__mdt config = RoutingConfig__mdt.getInstance(AppUtils.resolve(ns, 'Default_Routing'));",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 7: The CI/CD Deployment Test Failure
    7: [
        {
            "id": "s7_c1",
            "label": "SeeAllData=true Unit Test Patch",
            "description": "Applies @isTest(SeeAllData=true) to bypass writing mocked data in unit tests.",
            "code_diff": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -1,3 +1,5 @@\n+ @isTest(SeeAllData=true) // Deployment rejection in production!\n+ private class LeadRoutingTest { ... }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s7_c2",
            "label": "Empty System.assert(true) Coverage Fluff",
            "description": "Writes 500 lines of execution code with meaningless System.assert(true) statements.",
            "code_diff": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -15,3 +15,5 @@\n+ System.assert(true);\n+ System.assertEquals(1, 1); // Zero regression assertion!",
            "hidden_risk": 0.65,
        },
        {
            "id": "s7_c3",
            "label": "Test.isRunningTest() Hardcoded Logic Branching",
            "description": "Places if (Test.isRunningTest()) shortcuts inside production code paths.",
            "code_diff": "--- a/LeadService.cls\n+++ b/LeadService.cls\n@@ -10,3 +10,5 @@\n+ if (Test.isRunningTest()) return; // Skips production validation!",
            "hidden_risk": 0.50,
        },
        {
            "id": "s7_c4",
            "label": "Standard @testSetup Data Creation Factory",
            "description": "Uses @testSetup to create prerequisite test records without HTTP mock implementations.",
            "code_diff": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -5,3 +5,6 @@\n+ @testSetup static void setupData() {\n+     insert new Account(Name='Test Acct');\n+ }",
            "hidden_risk": 0.30,
        },
        {
            "id": "s7_c5",
            "label": "HttpCalloutMock + 85% Meaningful Assertions",
            "description": "Implements Test.setMock(HttpCalloutMock.class) and asserts state mutations rigorously.",
            "code_diff": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -10,3 +10,6 @@\n+ Test.setMock(HttpCalloutMock.class, new LeadMockResponse());\n+ Test.startTest();\n+ LeadService.sync();\n+ Test.stopTest();\n+ System.assertEquals('Synced', [SELECT Status__c FROM Lead].Status__c);",
            "hidden_risk": 0.15,
        },
        {
            "id": "s7_c6",
            "label": "Enterprise Test Framework with Multi-User Persona RunAs",
            "description": "Complete test isolation with User personas, HttpCalloutMock, and RunLocalTests validation pass.",
            "code_diff": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -10,3 +10,7 @@\n+ System.runAs(TestFactory.createStandardUser()) {\n+     Test.setMock(HttpCalloutMock.class, new ErpMockGenerator(200));\n+     Test.startTest(); LeadService.routeLeads(testLeads); Test.stopTest();\n+     System.assertEquals(1, [SELECT count() FROM AsyncApexJob WHERE Status='Completed']);\n+ }",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 8: The Row Lock & Record Contention Outage
    8: [
        {
            "id": "s8_c1",
            "label": "Parallel Asynchronous Parent Record Updates",
            "description": "Fires multiple asynchronous jobs updating the same parent Account without lock coordination.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -12,3 +12,5 @@\n+ for (Order o : orders) {\n+     System.enqueueJob(new UpdateParentAccountQueueable(o.AccountId)); // UNABLE_TO_LOCK_ROW!\n+ }",
            "hidden_risk": 0.85,
        },
        {
            "id": "s8_c2",
            "label": "Sleep Loop Thread Delay",
            "description": "Attempts busy-waiting while (true) spinlock inside Apex to wait for row locks.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,5 @@\n+ Long start = DateTime.now().getTime();\n+ while (DateTime.now().getTime() - start < 2000) { } // CPU timeout exception!",
            "hidden_risk": 0.70,
        },
        {
            "id": "s8_c3",
            "label": "Generic Catch Block with Silent Drop",
            "description": "Catches DmlException and drops failed records silently without retry queue.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,5 @@\n+ try { update parentAcct; } catch (DmlException e) { /* silently ignore lock fail */ }",
            "hidden_risk": 0.50,
        },
        {
            "id": "s8_c4",
            "label": "FOR UPDATE Query on Parent Records",
            "description": "Applies [SELECT Id FROM Account WHERE Id IN :ids FOR UPDATE] to lock parent records synchronously.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,5 @@\n+ Map<Id, Account> locked = new Map<Id, Account>([SELECT Id FROM Account WHERE Id IN :accIds FOR UPDATE]);\n+ update locked.values();",
            "hidden_risk": 0.30,
        },
        {
            "id": "s8_c5",
            "label": "Deterministic Order by ID with FOR UPDATE",
            "description": "Locks parent records sorted by ID (preventing mutual deadlocks) with exponential backoff retry.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,6 @@\n+ List<Account> parents = [SELECT Id FROM Account WHERE Id IN :accIds ORDER BY Id FOR UPDATE];\n+ Database.update(parents, false);",
            "hidden_risk": 0.15,
        },
        {
            "id": "s8_c6",
            "label": "Platform Event Buffering + Transaction Retry Finalizer",
            "description": "Decouples concurrent parent updates via high-throughput Platform Events with automated lock retry queue.",
            "code_diff": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,6 @@\n+ EventBus.publish(new ParentRollupUpdate__e(AccountId__c = accId, Amount__c = total));\n+ // Serialized by event bus subscriber trigger with zero row contention",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 9: The CPU Timeout & Heavy JSON Deserializer
    9: [
        {
            "id": "s9_c1",
            "label": "Deep JSON.deserializeUntyped on 10MB Payload",
            "description": "Calls JSON.deserializeUntyped() on mega JSON string, navigating nested untyped maps.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,6 @@\n+ Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(heavyBody);\n+ // 15,000ms CPU Timeout breached!",
            "hidden_risk": 0.85,
        },
        {
            "id": "s9_c2",
            "label": "Regex String Matching on Raw JSON Payload",
            "description": "Applies complex nested regular expressions over 10MB string payload.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,5 @@\n+ Pattern p = Pattern.compile('\"items\":\\[(.*?)\\]');\n+ Matcher m = p.matcher(heavyBody); // Regex catastrophic backtracking!",
            "hidden_risk": 0.65,
        },
        {
            "id": "s9_c3",
            "label": "Synchronous Strict Typed JSON.deserialize",
            "description": "Deserializes into strongly-typed Apex DTO classes synchronously in request thread.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,5 @@\n+ HeavyResponseDto dto = (HeavyResponseDto) JSON.deserialize(heavyBody, HeavyResponseDto.class);",
            "hidden_risk": 0.45,
        },
        {
            "id": "s9_c4",
            "label": "Queueable Async Chunked Parsing",
            "description": "Enqueues payload processing into Queueable thread with increased 60,000ms CPU limits.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,5 @@\n+ System.enqueueJob(new AsyncPayloadProcessor(heavyBody));",
            "hidden_risk": 0.30,
        },
        {
            "id": "s9_c5",
            "label": "JSONParser Forward-Only Streaming Token Parser",
            "description": "Parses payload sequentially using JSONParser without loading entire tree into memory.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,7 @@\n+ JSONParser parser = JSON.createParser(heavyBody);\n+ while (parser.nextToken() != null) {\n+     if (parser.getCurrentToken() == JSONToken.FIELD_NAME && parser.getText() == 'orderId') { ... }\n+ }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s9_c6",
            "label": "Streaming Token Parser with Chunked Database Insertion",
            "description": "Forward-only parser with Database.insert(chunk, false) buffer, zero heap bloat and <2,000ms CPU time.",
            "code_diff": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,8 @@\n+ JSONParser parser = JSON.createParser(heavyBody);\n+ List<Item__c> buffer = new List<Item__c>();\n+ while (parser.nextToken() != null) {\n+     // Flush buffer every 200 items\n+ }",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 10: The Infinite Recursion & Event Storm
    10: [
        {
            "id": "s10_c1",
            "label": "Unprotected Trigger with Direct update Trigger.new",
            "description": "Executes update list inside after update trigger with zero recursion flags.",
            "code_diff": "--- a/CaseTrigger.trigger\n+++ b/CaseTrigger.trigger\n@@ -5,3 +5,6 @@\n+ for (Case c : Trigger.new) c.Status = 'Escalated';\n+ update Trigger.new; // Maximum trigger depth exceeded: 16 recursions!",
            "hidden_risk": 0.85,
        },
        {
            "id": "s10_c2",
            "label": "Static Boolean Flag isExecuting Trigger Guard",
            "description": "Uses single static Boolean isFirstRun = true, which fails on multi-chunk batch DML.",
            "code_diff": "--- a/CaseGuard.cls\n+++ b/CaseGuard.cls\n@@ -1,3 +1,5 @@\n+ public class CaseGuard {\n+     public static Boolean isFirstRun = true; // Breaks on chunk 2 of 200 records!\n+ }",
            "hidden_risk": 0.65,
        },
        {
            "id": "s10_c3",
            "label": "Field Value Comparison in Trigger Loop",
            "description": "Compares oldMap vs newMap but forgets to handle bulk null transitions.",
            "code_diff": "--- a/CaseTrigger.trigger\n+++ b/CaseTrigger.trigger\n@@ -5,3 +5,5 @@\n+ if (Trigger.oldMap.get(c.Id).Status != c.Status) { update c; }",
            "hidden_risk": 0.50,
        },
        {
            "id": "s10_c4",
            "label": "Set<Id> Processed Record ID Cache Guard",
            "description": "Maintains Set<Id> processedIds = new Set<Id>() to prevent re-processing identical record IDs.",
            "code_diff": "--- a/CaseGuard.cls\n+++ b/CaseGuard.cls\n@@ -1,3 +1,6 @@\n+ public class CaseGuard {\n+     private static Set<Id> processed = new Set<Id>();\n+     public static Boolean isProcessed(Id cId) { return !processed.add(cId); }\n+ }",
            "hidden_risk": 0.30,
        },
        {
            "id": "s10_c5",
            "label": "Trigger Handler Framework with Depth Counter",
            "description": "Uses standard TriggerHandler framework with maxLoopCount(2) and transaction recursion guard.",
            "code_diff": "--- a/CaseTriggerHandler.cls\n+++ b/CaseTriggerHandler.cls\n@@ -1,3 +1,6 @@\n+ public class CaseTriggerHandler extends TriggerHandler {\n+     public CaseTriggerHandler() { this.setMaxLoopCount(2); }\n+     public override void afterUpdate() { ... }\n+ }",
            "hidden_risk": 0.15,
        },
        {
            "id": "s10_c6",
            "label": "Idempotent Event Replay with Transaction Finalizer",
            "description": "Enterprise event correlation ID deduplication with event replay guard and zero trigger loop possibility.",
            "code_diff": "--- a/CaseService.cls\n+++ b/CaseService.cls\n@@ -5,3 +5,6 @@\n+ Set<String> idempotencyKeys = Pluck.strings(events, 'Correlation_Id__c');\n+ if (DeduplicationService.isDuplicate(idempotencyKeys)) return;\n+ CaseDomain.applyStateTransitions(events);",
            "hidden_risk": 0.05,
        },
    ],

    # Stage 11: The Hardcoded Integration Secret Leak
    11: [
        {
            "id": "s11_c1",
            "label": "Hardcoded Authorization Bearer Token in Apex Class",
            "description": "Hardcodes raw API secret key 'bearer_live_secret_998877' in public repository Apex class.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,6 @@\n+ HttpRequest req = new HttpRequest();\n+ req.setHeader('Authorization', 'Bearer sk_live_998877665544332211'); // CRITICAL SECRET EXPOSURE!\n+ req.setEndpoint('https://api.gateway.com/charge');",
            "hidden_risk": 0.85,
        },
        {
            "id": "s11_c2",
            "label": "Custom Setting with Raw Secret String Field",
            "description": "Stores API key in public Custom Setting without field encryption or masking.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ Gateway_Key__c key = Gateway_Key__c.getInstance();\n+ req.setHeader('Authorization', 'Bearer ' + key.Secret__c); // Exposed to SOQL!",
            "hidden_risk": 0.65,
        },
        {
            "id": "s11_c3",
            "label": "Protected Custom Metadata Type (CMDT)",
            "description": "Stores API secret in protected CMDT, hidden from subscriber orgs but exposed in apex debug logs.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ Gateway_Secret__mdt secret = Gateway_Secret__mdt.getInstance('Stripe_Prod');\n+ System.debug('Key: ' + secret.Api_Key__c); // Leak in debug log!",
            "hidden_risk": 0.50,
        },
        {
            "id": "s11_c4",
            "label": "Apex Crypto Decryption from Protected Resource",
            "description": "Stores encrypted blob and decrypts using Crypto.decryptWithManagedIV() at runtime.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ Blob decrypted = Crypto.decryptWithManagedIV('AES256', key, encryptedSecret);",
            "hidden_risk": 0.30,
        },
        {
            "id": "s11_c5",
            "label": "Standard Salesforce Named Credential (callout:)",
            "description": "Uses standard Named Credential endpoint without any credentials in Apex code.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ HttpRequest req = new HttpRequest();\n+ req.setEndpoint('callout:Payment_Gateway/charge'); // Zero secrets in code!",
            "hidden_risk": 0.15,
        },
        {
            "id": "s11_c6",
            "label": "External Credential with OAuth2 JWT Bearer Flow + Certificate Vault",
            "description": "Modern Salesforce External Credential using mutual TLS, OAuth2 JWT flow, and zero visible tokens.",
            "code_diff": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ req.setEndpoint('callout:Secure_Payment_Vault/v2/charge');\n+ // Handled entirely via Salesforce External Credential Principal with mTLS",
            "hidden_risk": 0.05,
        },
    ],
}
