"""
Business logic for creating experiments and computing their results:
pulls exposure ("Experiment Viewed") and conversion events, runs them
through the experiment analytics engine, and declares a winner.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.analytics import metrics as metrics_engine
from app.analytics.experiment import compute_experiment_results
from app.repositories.analytics_repository import AnalyticsRepository
from app.repositories.experiment_repository import ExperimentRepository
from app.schemas.experiment import CreateExperimentRequest, ExperimentResponse, ExperimentResults, VariantResult
from app.services.project_service import ProjectService

EXPOSURE_EVENT_NAME = "Experiment Viewed"


class ExperimentService:
    def __init__(self, db: Session):
        self.repo = ExperimentRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.project_service = ProjectService(db)

    def create(self, project_id: uuid.UUID, user_id: uuid.UUID, payload: CreateExperimentRequest) -> ExperimentResponse:
        self.project_service.get_owned_project(project_id, user_id)
        variants = [v.model_dump() for v in payload.variants]
        experiment = self.repo.create(project_id, payload.name, payload.conversion_event, variants)
        return self._to_response(experiment)

    def list_for_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[ExperimentResponse]:
        self.project_service.get_owned_project(project_id, user_id)
        experiments = self.repo.list_for_project(project_id)
        return [self._to_response(e) for e in experiments]

    def results(self, project_id: uuid.UUID, experiment_id: uuid.UUID, user_id: uuid.UUID) -> ExperimentResults:
        self.project_service.get_owned_project(project_id, user_id)

        experiment = self.repo.get_by_id(experiment_id)
        if not experiment or experiment.project_id != project_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Experiment not found")

        exposure_events = self.analytics_repo.get_events_by_name(project_id, EXPOSURE_EVENT_NAME)
        conversion_events = self.analytics_repo.get_events_by_name(project_id, experiment.conversion_event)

        exposure_frame = metrics_engine._events_to_frame(list(exposure_events))
        conversion_frame = metrics_engine._events_to_frame(list(conversion_events))

        variant_names = [v.name for v in experiment.variants]
        control_name = next((v.name for v in experiment.variants if v.is_control), variant_names[0])
        variant_id_by_name = {v.name: v.id for v in experiment.variants}

        raw_results = compute_experiment_results(
            exposure_frame, conversion_frame, str(experiment.id), variant_names, control_name
        )

        variant_results = [
            VariantResult(variant_id=variant_id_by_name[r["name"]], **r) for r in raw_results
        ]

        winner_id = self._determine_winner(variant_results)

        return ExperimentResults(
            experiment=self._to_response(experiment), variants=variant_results, winner_variant_id=winner_id
        )

    def _determine_winner(self, variant_results: list[VariantResult]) -> uuid.UUID | None:
        significant_challengers = [v for v in variant_results if not v.is_control and v.is_significant]
        if not significant_challengers:
            return None
        best = max(significant_challengers, key=lambda v: v.conversion_rate)
        control = next((v for v in variant_results if v.is_control), None)
        if control and best.conversion_rate <= control.conversion_rate:
            return control.variant_id
        return best.variant_id

    @staticmethod
    def _to_response(experiment) -> ExperimentResponse:
        return ExperimentResponse(
            id=experiment.id,
            project_id=experiment.project_id,
            name=experiment.name,
            conversion_event=experiment.conversion_event,
            status=experiment.status.value if hasattr(experiment.status, "value") else experiment.status,
            variants=list(experiment.variants),
            created_at=experiment.created_at,
        )
