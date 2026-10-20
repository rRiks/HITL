from typing import Dict, Any, Tuple, Optional

class RulesEvaluator:
    """
    RulesEvaluator (Single Responsibility: Token & Keyword Matching)
    Scans user prompt instructions against stage domain keyword groups.
    """
    def __init__(self, stage_rules: Optional[Dict[int, Dict[str, Any]]] = None):
        self._rules = stage_rules if stage_rules is not None else DEFAULT_STAGE_RULES

    def evaluate_prompt(self, stage_id: int, prompt_text: str) -> Tuple[float, Dict[str, bool], str]:
        """
        Scans prompt text against domain keyword groups.
        Returns:
            - risk_reduction: float (amount by which risk drops, up to 0.70)
            - matches: Dict[str, bool] (which groups matched: 'core', 'tuning', 'hardening')
            - hint: str (coaching hint for the team if they missed an architectural aspect)
        """
        norm_text = prompt_text.lower().strip()
        rules = self._rules.get(stage_id, {})
        
        core_keywords = rules.get("core_keywords", [])
        tuning_keywords = rules.get("tuning_keywords", [])
        hardening_keywords = rules.get("hardening_keywords", [])

        core_hits = any(k in norm_text for k in core_keywords)
        tuning_hits = any(k in norm_text for k in tuning_keywords)
        hardening_hits = any(k in norm_text for k in hardening_keywords)

        reduction = 0.0
        if core_hits:
            reduction += 0.35
        if tuning_hits:
            reduction += 0.20
        if hardening_hits:
            reduction += 0.15

        matches = {
            "core": core_hits,
            "tuning": tuning_hits,
            "hardening": hardening_hits,
        }

        # Select contextual coaching hint
        if not core_hits:
            hint = rules.get("core_hint", "Specify a standard architecture pattern (e.g. bulk collections or batching).")
        elif not tuning_hits:
            hint = rules.get("tuning_hint", "Add specific scoping parameters, chunk limits, or describe caching.")
        elif not hardening_hits:
            hint = rules.get("hardening_hint", "Consider enterprise resiliency (stateful error tracking or platform events).")
        else:
            hint = "Architecture is production-hardened."

        return reduction, matches, hint


DEFAULT_STAGE_RULES: Dict[int, Dict[str, Any]] = {
    1: {
        "core_keywords": ["map", "set", "bulkify", "collection", "outside loop"],
        "tuning_keywords": ["soql outside loop", "trigger.new", "where id in", "bulk", "query once"],
        "hardening_keywords": ["selector", "pluck", "domain", "layer", "enterprise"],
        "core_hint": "Specify bulk collections (Set<Id> and Map<Id, Account>) to move SOQL queries outside loops.",
        "tuning_hint": "Bind Account IDs with 'WHERE Id IN :accIds' to query all records in one transaction.",
        "hardening_hint": "Wrap the query in a selector layer with null-safe map retrieval.",
    },
    2: {
        "core_keywords": ["with sharing", "stripinaccessible", "fls", "security"],
        "tuning_keywords": ["user_mode", "with user_mode", "accesslevel", "field-level", "updatable"],
        "hardening_keywords": ["security.stripinaccessible", "sobjectaccessdecision", "user mode"],
        "core_hint": "Enforce 'with sharing' class declaration and check Field-Level Security.",
        "tuning_hint": "Use Apex WITH USER_MODE or Security.stripInaccessible() on update operations.",
        "hardening_hint": "Filter stripped fields using SObjectAccessDecision to protect confidential columns.",
    },
    3: {
        "core_keywords": ["queueable", "async", "separate transaction", "decouple"],
        "tuning_keywords": ["system.enqueuejob", "enqueuejob", "user provision", "future"],
        "hardening_keywords": ["platform event", "eventbus", "finalizer", "raisesplatformevents"],
        "core_hint": "Separate Setup (User) and Non-Setup (Contact) DML into independent transaction contexts.",
        "tuning_hint": "Use a Queueable Apex job (System.enqueueJob) to asynchronously create the User.",
        "hardening_hint": "Decouple via high-volume Platform Events for zero Mixed-DML possibility.",
    },
    4: {
        "core_keywords": ["this.template", "shadow dom", "@salesforce/schema", "template"],
        "tuning_keywords": ["lightning message service", "lms", "getrecord", "two-way", "wire"],
        "hardening_keywords": ["lightning data service", "lds", "wire adapter", "lightning/messageService"],
        "core_hint": "Scope DOM queries inside 'this.template.querySelector' and import compile-time schema tokens.",
        "tuning_hint": "Use Lightning Data Service (@wire getRecord) instead of manual DOM queries.",
        "hardening_hint": "Publish state changes through Lightning Message Service (LMS).",
    },
    5: {
        "core_keywords": ["batchable", "database.batchable", "batch apex", "batch"],
        "tuning_keywords": ["200", "chunk", "scope", "querylocator", "limits.getqueueablejobs"],
        "hardening_keywords": ["stateful", "raisesplatformevents", "batchapexerrorevent", "database.stateful"],
        "core_hint": "Replace runaway Queueable loops with standard Database.Batchable Apex.",
        "tuning_hint": "Configure execution scope to 200 records per chunk with automatic throttling.",
        "hardening_hint": "Implement Database.Stateful and Database.RaisesPlatformEvents for resilient retry tracking.",
    },
    6: {
        "core_keywords": ["custom metadata", "cmdt", "schema.sobjecttype", "metadata"],
        "tuning_keywords": ["getrecordtypeinfosbydevelopername", "describe cache", "developername"],
        "hardening_keywords": ["dynamic describe", "namespace", "apputils", "org portability"],
        "core_hint": "Remove hardcoded 18-character IDs using dynamic Schema describe caching.",
        "tuning_hint": "Retrieve RecordType IDs dynamically via SObjectType.getRecordTypeInfosByDeveloperName().",
        "hardening_hint": "Store queue mappings in Custom Metadata Types (CMDT) with namespace-agnostic lookups.",
    },
    7: {
        "core_keywords": ["httpcalloutmock", "test.setmock", "mock", "unit test"],
        "tuning_keywords": ["test.starttest", "test.stoptest", "runlocaltests", "assert"],
        "hardening_keywords": ["system.runas", "85%", "testfactory", "meaningful assert"],
        "core_hint": "Implement HttpCalloutMock and write isolated test data without SeeAllData=true.",
        "tuning_hint": "Wrap execution inside Test.startTest() / Test.stopTest() to reset async governor limits.",
        "hardening_hint": "Execute test logic under standard user personas via System.runAs() with 85%+ coverage.",
    },
    8: {
        "core_keywords": ["for update", "row lock", "locking", "contention"],
        "tuning_keywords": ["order by id", "deadlock", "retry", "unable_to_lock_row"],
        "hardening_keywords": ["platform event", "backoff", "eventbus", "exponential"],
        "core_hint": "Apply SOQL FOR UPDATE to serialize access to shared parent Account records.",
        "tuning_hint": "Sort parent record queries by ID ('ORDER BY Id') to eliminate mutual circular deadlocks.",
        "hardening_hint": "Buffer concurrent updates via Platform Events or exponential retry finalizers.",
    },
    9: {
        "core_keywords": ["jsonparser", "createparser", "streaming", "parser"],
        "tuning_keywords": ["nexttoken", "tokentype", "chunk", "cpu limit"],
        "hardening_keywords": ["forward only", "buffer", "database.insert", "heap"],
        "core_hint": "Replace memory-heavy JSON.deserializeUntyped with a streaming JSONParser.",
        "tuning_hint": "Iterate tokens using parser.nextToken() to stream items forward without heap bloat.",
        "hardening_hint": "Flush deserialized records in 200-item chunks using Database.insert(buffer, false).",
    },
    10: {
        "core_keywords": ["recursion", "triggerhandler", "depth", "loop"],
        "tuning_keywords": ["set<id>", "processedids", "maxloopcount", "guard"],
        "hardening_keywords": ["idempotency", "correlation id", "deduplication", "event replay"],
        "core_hint": "Add a static recursion guard or TriggerHandler framework with depth counter.",
        "tuning_hint": "Track processed record IDs in a Set<Id> to prevent redundant DML execution in after update.",
        "hardening_hint": "Implement correlation ID deduplication to ensure idempotent event handling.",
    },
    11: {
        "core_keywords": ["named credential", "callout:", "external credential", "secret"],
        "tuning_keywords": ["vault", "mtls", "certificate", "mask"],
        "hardening_keywords": ["oauth2", "jwt", "principal", "external credential principal"],
        "core_hint": "Eliminate hardcoded bearer tokens by migrating to Salesforce Named Credentials ('callout:').",
        "tuning_hint": "Configure endpoint security in Named Credentials so keys are never exposed in Apex code.",
        "hardening_hint": "Implement OAuth2 JWT Bearer Flow via External Credentials with mutual TLS certificate vault.",
    },
}
