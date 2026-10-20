from typing import Tuple, Dict, Any, Optional
from .rules_evaluator import RulesEvaluator

class CopilotEngine:
    """
    CopilotEngine (Single Responsibility: Multi-Turn Conversation & Diff Generation)
    Drives the interactive Human-AI prompt steering loop without external LLMs.
    """
    def __init__(self, evaluator: Optional[RulesEvaluator] = None):
        self.evaluator = evaluator if evaluator is not None else RulesEvaluator()

    def process_turn(
        self,
        stage_id: int,
        user_prompt: str,
        current_risk: float,
        turn_index: int,
        stage_title: str = "Production Wave",
    ) -> Tuple[str, str, float, bool]:
        """
        Executes a multi-turn human-AI dialogue step.
        Returns:
            - reply_text: str (Conversational Copilot response)
            - updated_code_diff: str (Refactored code diff reflecting the prompt instructions)
            - new_risk: float (Adjusted hidden risk probability, down to 0.05)
            - is_hardened: bool (True if all architectural criteria were achieved)
        """
        reduction, matches, hint = self.evaluator.evaluate_prompt(stage_id, user_prompt)
        new_risk = max(0.05, current_risk - reduction)
        
        diff_templates = STAGE_DIFF_TEMPLATES.get(stage_id, {})

        if matches["core"] and matches["tuning"] and matches["hardening"]:
            reply = (
                f"🤖 Copilot: Outstanding architectural guidance! Refactored the implementation into an "
                f"enterprise-hardened pattern with defensive transaction isolation and error safeguards. "
                f"Hidden risk minimized to 5%. Ready for production deployment!"
            )
            code_diff = diff_templates.get("hardened", diff_templates.get("refactored", ""))
            return reply, code_diff, new_risk, True

        elif matches["core"] and matches["tuning"]:
            reply = (
                f"🤖 Copilot: Great feedback! Refactored the logic to use standard bulk/batch scoping. "
                f"Risk dropped significantly to ~{int(new_risk * 100)}%. "
                f"(Tip for hardening: {hint})"
            )
            code_diff = diff_templates.get("refactored", diff_templates.get("baseline", ""))
            return reply, code_diff, new_risk, False

        elif matches["core"]:
            reply = (
                f"🤖 Copilot: Understood. I applied the core pattern you suggested. "
                f"Risk reduced to ~{int(new_risk * 100)}%. "
                f"(Coaching: {hint})"
            )
            code_diff = diff_templates.get("refactored", diff_templates.get("baseline", ""))
            return reply, code_diff, new_risk, False

        else:
            reply = (
                f"🤖 Copilot: I reviewed your prompt and applied general code styling, but no specific "
                f"architectural pattern was identified. Risk remains high at ~{int(new_risk * 100)}%. "
                f"Coaching: {hint}"
            )
            code_diff = diff_templates.get("baseline", "")
            return reply, code_diff, new_risk, False


# -------------------------------------------------------------
# Progressive Code Diff Revisions for Steer Prompting
# -------------------------------------------------------------
STAGE_DIFF_TEMPLATES: Dict[int, Dict[str, str]] = {
    1: {
        "baseline": "--- a/ContactTrigger.trigger\n+++ b/ContactTrigger.trigger\n@@ -10,3 +10,5 @@\n+ for (Contact c : Trigger.new) {\n+     Account acc = [SELECT Id, Tier__c FROM Account WHERE Id = :c.AccountId]; // SOQL in loop!\n+ }",
        "refactored": "--- a/ContactTrigger.trigger\n+++ b/ContactTrigger.trigger\n@@ -10,3 +10,7 @@\n+ Set<Id> accIds = new Set<Id>();\n+ for (Contact c : Trigger.new) if (c.AccountId != null) accIds.add(c.AccountId);\n+ Map<Id, Account> accMap = new Map<Id, Account>([SELECT Id, Tier__c FROM Account WHERE Id IN :accIds]);\n+ for (Contact c : Trigger.new) { Account a = accMap.get(c.AccountId); }",
        "hardened": "--- a/ContactService.cls\n+++ b/ContactService.cls\n@@ -10,3 +10,6 @@\n+ Set<Id> accIds = Pluck.ids(contacts, Contact.AccountId);\n+ Map<Id, Account> accMap = AccountsSelector.newInstance().selectById(accIds);\n+ ContactDomain.enrichTiers(contacts, accMap); // Zero governor exposure",
    },
    2: {
        "baseline": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,5 @@\n+ public without sharing class PortalService {\n+     public static void updateSSN(Id cId, String ssn) { update new Contact(Id=cId, SSN__c=ssn); }\n+ }",
        "refactored": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,6 @@\n+ public with sharing class PortalService {\n+     SObjectAccessDecision decision = Security.stripInaccessible(AccessType.UPDATABLE, contacts);\n+     update decision.getRecords();\n+ }",
        "hardened": "--- a/PortalService.cls\n+++ b/PortalService.cls\n@@ -1,3 +1,5 @@\n+ public with sharing class PortalService {\n+     List<Contact> records = [SELECT Id, Name FROM Contact WHERE Id = :conId WITH USER_MODE];\n+     Database.update(records, AccessLevel.USER_MODE);\n+ }",
    },
    3: {
        "baseline": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,6 @@\n+ insert new Contact(LastName = 'Smith');\n+ insert new User(Username = 'smith@org.com'); // Mixed DML fatal error!\n+ insert new PermissionSetAssignment(AssigneeId = u.Id);",
        "refactored": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ System.enqueueJob(new ProvisionUserQueueable(con.Id, 'smith@org.com'));",
        "hardened": "--- a/OnboardingService.cls\n+++ b/OnboardingService.cls\n@@ -10,3 +10,5 @@\n+ insert con;\n+ EventBus.publish(new UserOnboarding__e(ContactId__c = con.Id)); // Perfect async boundary",
    },
    4: {
        "baseline": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -5,3 +5,5 @@\n+ renderedCallback() {\n+     document.querySelector('lightning-input').value = 100; // Blocked by LWS!\n+ }",
        "refactored": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -5,3 +5,5 @@\n+ const input = this.template.querySelector('lightning-input');\n+ if (input) input.value = 100;",
        "hardened": "--- a/quoteBuilder.js\n+++ b/quoteBuilder.js\n@@ -1,3 +1,6 @@\n+ import { wire } from 'lwc';\n+ import { getRecord } from 'lightning/uiRecordApi';\n+ import TIER_FIELD from '@salesforce/schema/Account.Tier__c';\n+ @wire(getRecord, { recordId: '$recordId', fields: [TIER_FIELD] }) record;",
    },
    5: {
        "baseline": "--- a/LeadService.cls\n+++ b/LeadService.cls\n@@ -10,3 +10,6 @@\n+ for (Lead l : leads) {\n+     System.enqueueJob(new SyncQueueable(l.Id)); // Exceeds 50 queueable limit!\n+ }",
        "refactored": "--- a/LeadBatch.cls\n+++ b/LeadBatch.cls\n@@ -1,3 +1,6 @@\n+ public class LeadBatch implements Database.Batchable<sObject>, Database.AllowsCallouts {\n+     public Database.QueryLocator start(Database.BatchableContext bc) { ... }\n+     public void execute(Database.BatchableContext bc, List<Lead> scope) { ... }\n+ }",
        "hardened": "--- a/LeadBatch.cls\n+++ b/LeadBatch.cls\n@@ -1,3 +1,6 @@\n+ public class LeadBatch implements Database.Batchable<sObject>, Database.Stateful, Database.RaisesPlatformEvents {\n+     public Integer totalErrors = 0;\n+     // Resilient batching with automated retry throttling\n+ }",
    },
    6: {
        "baseline": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -8,3 +8,5 @@\n+ if (lead.RecordTypeId == '0125e000000ABC1') {\n+     lead.OwnerId = '0055e000000XYZ9';\n+ }",
        "refactored": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,5 @@\n+ Lead_Routing_Rule__mdt rule = Lead_Routing_Rule__mdt.getInstance('Partner_Lead');\n+ Id rtId = Schema.SObjectType.Lead.getRecordTypeInfosByDeveloperName().get(rule.Record_Type__c).getRecordTypeId();",
        "hardened": "--- a/LeadRoutingEngine.cls\n+++ b/LeadRoutingEngine.cls\n@@ -5,3 +5,6 @@\n+ String ns = AppUtils.getNamespacePrefix();\n+ Id rtId = SchemaUtils.getRecordTypeId(Lead.SObjectType, 'Partner');\n+ RoutingConfig__mdt config = RoutingConfig__mdt.getInstance(AppUtils.resolve(ns, 'Default_Routing'));",
    },
    7: {
        "baseline": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -1,3 +1,5 @@\n+ @isTest(SeeAllData=true)\n+ private class LeadRoutingTest { ... }",
        "refactored": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -10,3 +10,6 @@\n+ Test.setMock(HttpCalloutMock.class, new LeadMockResponse());\n+ Test.startTest(); LeadService.sync(); Test.stopTest();\n+ System.assertEquals('Synced', [SELECT Status__c FROM Lead].Status__c);",
        "hardened": "--- a/LeadRoutingTest.cls\n+++ b/LeadRoutingTest.cls\n@@ -10,3 +10,7 @@\n+ System.runAs(TestFactory.createStandardUser()) {\n+     Test.setMock(HttpCalloutMock.class, new ErpMockGenerator(200));\n+     Test.startTest(); LeadService.routeLeads(testLeads); Test.stopTest();\n+     System.assertEquals(1, [SELECT count() FROM AsyncApexJob WHERE Status='Completed']);\n+ }",
    },
    8: {
        "baseline": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -12,3 +12,5 @@\n+ for (Order o : orders) {\n+     System.enqueueJob(new UpdateParentAccountQueueable(o.AccountId)); // UNABLE_TO_LOCK_ROW\n+ }",
        "refactored": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,6 @@\n+ List<Account> parents = [SELECT Id FROM Account WHERE Id IN :accIds ORDER BY Id FOR UPDATE];\n+ Database.update(parents, false);",
        "hardened": "--- a/OrderSync.cls\n+++ b/OrderSync.cls\n@@ -10,3 +10,6 @@\n+ EventBus.publish(new ParentRollupUpdate__e(AccountId__c = accId, Amount__c = total));\n+ // Serialized by event bus subscriber trigger with zero row contention",
    },
    9: {
        "baseline": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,6 @@\n+ Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(heavyBody);\n+ // 15,000ms CPU Timeout breached!",
        "refactored": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,7 @@\n+ JSONParser parser = JSON.createParser(heavyBody);\n+ while (parser.nextToken() != null) {\n+     if (parser.getCurrentToken() == JSONToken.FIELD_NAME && parser.getText() == 'orderId') { ... }\n+ }",
        "hardened": "--- a/PayloadParser.cls\n+++ b/PayloadParser.cls\n@@ -5,3 +5,8 @@\n+ JSONParser parser = JSON.createParser(heavyBody);\n+ List<Item__c> buffer = new List<Item__c>();\n+ while (parser.nextToken() != null) {\n+     // Flush buffer every 200 items into Database.insert\n+ }",
    },
    10: {
        "baseline": "--- a/CaseTrigger.trigger\n+++ b/CaseTrigger.trigger\n@@ -5,3 +5,6 @@\n+ for (Case c : Trigger.new) c.Status = 'Escalated';\n+ update Trigger.new; // Trigger loop: 16 recursions!",
        "refactored": "--- a/CaseTriggerHandler.cls\n+++ b/CaseTriggerHandler.cls\n@@ -1,3 +1,6 @@\n+ public class CaseTriggerHandler extends TriggerHandler {\n+     public CaseTriggerHandler() { this.setMaxLoopCount(2); }\n+     public override void afterUpdate() { ... }\n+ }",
        "hardened": "--- a/CaseService.cls\n+++ b/CaseService.cls\n@@ -5,3 +5,6 @@\n+ Set<String> idempotencyKeys = Pluck.strings(events, 'Correlation_Id__c');\n+ if (DeduplicationService.isDuplicate(idempotencyKeys)) return;\n+ CaseDomain.applyStateTransitions(events);",
    },
    11: {
        "baseline": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,6 @@\n+ HttpRequest req = new HttpRequest();\n+ req.setHeader('Authorization', 'Bearer sk_live_998877665544332211'); // Secret exposure!\n+ req.setEndpoint('https://api.gateway.com/charge');",
        "refactored": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ HttpRequest req = new HttpRequest();\n+ req.setEndpoint('callout:Payment_Gateway/charge'); // Named credential\n+ http.send(req);",
        "hardened": "--- a/PaymentService.cls\n+++ b/PaymentService.cls\n@@ -5,3 +5,5 @@\n+ req.setEndpoint('callout:Secure_Payment_Vault/v2/charge');\n+ // Handled entirely via Salesforce External Credential Principal with mTLS vault",
    },
}
