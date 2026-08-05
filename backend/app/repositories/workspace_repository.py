"""
Direct DB access for workspaces and their memberships.
"""
import uuid
from typing import Optional, Sequence

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole


class WorkspaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, name: str, slug: str, owner_id: uuid.UUID) -> Workspace:
        workspace = Workspace(name=name, slug=slug)
        self.db.add(workspace)
        self.db.flush()

        member = WorkspaceMember(workspace_id=workspace.id, user_id=owner_id, role=WorkspaceRole.OWNER)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(workspace)
        return workspace

    def list_for_user(self, user_id: uuid.UUID) -> Sequence[tuple[Workspace, WorkspaceRole]]:
        rows = (
            self.db.query(Workspace, WorkspaceMember.role)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .filter(WorkspaceMember.user_id == user_id)
            .all()
        )
        return rows

    def get_membership(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> Optional[WorkspaceMember]:
        return (
            self.db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.user_id == user_id)
            .first()
        )

    def get_by_id(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        return self.db.query(Workspace).filter(Workspace.id == workspace_id).first()

    def list_members(self, workspace_id: uuid.UUID) -> Sequence[tuple[WorkspaceMember, User]]:
        return (
            self.db.query(WorkspaceMember, User)
            .join(User, User.id == WorkspaceMember.user_id)
            .filter(WorkspaceMember.workspace_id == workspace_id)
            .order_by(WorkspaceMember.created_at.asc())
            .all()
        )

    def get_member_by_id(self, workspace_id: uuid.UUID, member_id: uuid.UUID) -> Optional[WorkspaceMember]:
        return (
            self.db.query(WorkspaceMember)
            .filter(WorkspaceMember.id == member_id, WorkspaceMember.workspace_id == workspace_id)
            .first()
        )

    def add_member(self, workspace_id: uuid.UUID, user_id: uuid.UUID, role: WorkspaceRole) -> WorkspaceMember:
        member = WorkspaceMember(workspace_id=workspace_id, user_id=user_id, role=role)
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def count_owners(self, workspace_id: uuid.UUID) -> int:
        return (
            self.db.query(WorkspaceMember)
            .filter(WorkspaceMember.workspace_id == workspace_id, WorkspaceMember.role == WorkspaceRole.OWNER)
            .count()
        )

    def update_role(self, member: WorkspaceMember, role: WorkspaceRole) -> WorkspaceMember:
        member.role = role
        self.db.commit()
        self.db.refresh(member)
        return member

    def remove_member(self, member: WorkspaceMember) -> None:
        self.db.delete(member)
        self.db.commit()
