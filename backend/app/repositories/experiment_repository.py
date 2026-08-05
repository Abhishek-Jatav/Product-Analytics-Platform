"""
Direct DB access for experiments and their variants.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session, joinedload

from app.models.experiment import Experiment, Variant


class ExperimentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, project_id: uuid.UUID, name: str, conversion_event: str, variants: list[dict]) -> Experiment:
        experiment = Experiment(project_id=project_id, name=name, conversion_event=conversion_event)
        self.db.add(experiment)
        self.db.flush()

        for i, v in enumerate(variants):
            self.db.add(
                Variant(
                    experiment_id=experiment.id,
                    name=v["name"],
                    traffic_allocation=v["traffic_allocation"],
                    is_control=(i == 0),
                )
            )

        self.db.commit()
        self.db.refresh(experiment)
        return experiment

    def list_for_project(self, project_id: uuid.UUID) -> Sequence[Experiment]:
        return (
            self.db.query(Experiment)
            .options(joinedload(Experiment.variants))
            .filter(Experiment.project_id == project_id)
            .order_by(Experiment.created_at.desc())
            .all()
        )

    def get_by_id(self, experiment_id: uuid.UUID) -> Optional[Experiment]:
        return (
            self.db.query(Experiment)
            .options(joinedload(Experiment.variants))
            .filter(Experiment.id == experiment_id)
            .first()
        )
