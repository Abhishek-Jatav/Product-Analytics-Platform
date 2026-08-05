"""
Experiment endpoints: create/list experiments (with their variants),
and compute a running experiment's results (conversion rates,
significance, and winner).
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.experiment import CreateExperimentRequest
from app.services.experiment_service import ExperimentService

router = APIRouter(prefix="/projects/{project_id}/experiments", tags=["experiments"])


@router.post("")
def create_experiment(
    project_id: uuid.UUID,
    payload: CreateExperimentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiment = ExperimentService(db).create(project_id, current_user.id, payload)
    return success_response("Experiment created successfully", experiment.model_dump())


@router.get("")
def list_experiments(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    experiments = ExperimentService(db).list_for_project(project_id, current_user.id)
    return success_response("Experiments fetched", [e.model_dump() for e in experiments])


@router.get("/{experiment_id}/results")
def get_experiment_results(
    project_id: uuid.UUID,
    experiment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = ExperimentService(db).results(project_id, experiment_id, current_user.id)
    return success_response("Experiment results computed", results.model_dump())
