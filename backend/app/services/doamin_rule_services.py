from sqlalchemy.orm import Session
from app.repositories.doamin_rule_repository import create_domain_rule, update_domain_rule, delete_domain_rule, read_domain_rule

class DomainRuleService:
    
    def create_domain_rule(self,db: Session, domain: str, rule_type: str, score: int, priority: int | None = None, description: str | None = None):
        return create_domain_rule(db, domain, rule_type, score, priority, description)

    def update_domain_rule(self, db: Session, domain_rule_id: int, domain: str, rule_type: str, score: int, priority: int | None = None, description: str | None = None):
        return update_domain_rule(db, domain_rule_id, domain, rule_type, score, priority, description)

    def delete_domain_rule(self, db: Session, domain_rule_id: int):
        return delete_domain_rule(db, domain_rule_id)

    def read_domain_rule(self, db: Session):
        return read_domain_rule(db)

    def get_domain_rule(db: Session, domain: str):
        from email.utils import parseaddr
        email = parseaddr(domain)[1]
        
        domain = email.strip().lower()
        if "@" in domain:
            domain = domain.split("@")[-1]

        all_domain_rules = read_domain_rule(db)
        
        matched_rules = [
            rule
            for rule in all_domain_rules
            if domain.endswith(rule.domain_pattern.lower())
        ]

        if not matched_rules:
            return {
                "matched": False,
                "score": 0,
                "rule_type": "unknown",
                "rule": None,
                "status": "SAFE",
            }

        best_rule = max(
            matched_rules,
            key=lambda r: (
                r.priority or 0,
                len(r.domain_pattern), 
            ),
        )

        score = best_rule.score

        if score >= 100:
            status = "SPAM"
        elif score > 0:
            status = "SUSPICIOUS"
        else:
            status = "SAFE"
        
        return {
            "matched": True,
            "score": score,
            "rule_type": best_rule.rule_type,
            "rule": best_rule.domain_pattern,
            "status": status,
        }
