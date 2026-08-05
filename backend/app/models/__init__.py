"""
Import every model here so Alembic's autogenerate can discover them
through Base.metadata, and so the rest of the app can do
`from app.models import User` etc.
"""
from app.models.alert import AlertDirection, AlertMetric, AlertRule  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.experiment import Experiment, ExperimentStatus, Variant  # noqa: F401
from app.models.funnel import Funnel  # noqa: F401
from app.models.project import APIKey, Project  # noqa: F401
from app.models.segment import Segment  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole  # noqa: F401
