import datetime

from sqlalchemy.orm import Session
from app.models.domainrule import DomainRule


def create_domain_rule(
    db: Session,
    domain: str,
    rule_type: str,
    score: int,
    priority: int | None = None,
    description: str | None = None,
    created_at: datetime.datetime | None = None,
):
    domain_rule = DomainRule(
        domain_pattern=domain,
        rule_type=rule_type,
        score=score,
        priority=priority,
        description=description,
        created_at=created_at
    )
    db.add(domain_rule)
    db.commit()
    db.refresh(domain_rule)
    return domain_rule

def update_domain_rule(
    db: Session,
    domain_rule_id: int,
    domain: str,
    rule_type: str, score: int,
    priority: int | None = None,
    description: str | None = None
):
    domain_rule = db.query(DomainRule).filter(DomainRule.id == domain_rule_id, DomainRule.domain_pattern == domain).first()
    if domain_rule:
        domain_rule.domain_pattern = domain
        domain_rule.rule_type = rule_type
        domain_rule.score = score
        domain_rule.priority = priority
        domain_rule.description = description
        db.commit()
        db.refresh(domain_rule)
    return domain_rule

def delete_domain_rule(db: Session, domain_rule_id: int):
    domain_rule = db.query(DomainRule).filter(DomainRule.id == domain_rule_id).first()
    if domain_rule:
        db.delete(domain_rule)
        db.commit()
        return True
    return False

def read_domain_rule(db: Session):
    return db.query(DomainRule).order_by(DomainRule.id.asc()).all()
