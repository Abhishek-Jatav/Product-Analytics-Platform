"""
Business logic for workspaces: creation, listing, membership checks,
and team management (invite/list/update-role/remove) with real
role-based permission enforcement.

Note: "invite" here adds an EXISTING registered user directly - there's
no outbound email in this environment to send an invite link through,
so this is the honest version of that feature rather than a fake one.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.workspace import WorkspaceRole
from app.repositories.user_repository import UserRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import (
    CreateWorkspaceRequest,
    InviteMemberRequest,
    UpdateMemberRoleRequest,
    WorkspaceMemberResponse,
    WorkspaceResponse,
)
from app.utils.slug import slugify


class WorkspaceService:
    def __init__(self, db: Session):
        self.repo = WorkspaceRepository(db)
        self.user_repo = UserRepository(db)

    def create(self, payload: CreateWorkspaceRequest, owner_id: uuid.UUID) -> WorkspaceResponse:
        workspace = self.repo.create(name=payload.name, slug=slugify(payload.name), owner_id=owner_id)
        return WorkspaceResponse(id=workspace.id, name=workspace.name, slug=workspace.slug, role="owner")

    def list_for_user(self, user_id: uuid.UUID) -> list[WorkspaceResponse]:
        rows = self.repo.list_for_user(user_id)
        return [
            WorkspaceResponse(id=ws.id, name=ws.name, slug=ws.slug, role=role.value) for ws, role in rows
        ]

    def assert_member(self, workspace_id: uuid.UUID, user_id: uuid.UUID):
        membership = self.repo.get_membership(workspace_id, user_id)
        if not membership:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have access to this workspace")
        return membership

    def assert_role(self, workspace_id: uuid.UUID, user_id: uuid.UUID, allowed: list[WorkspaceRole]):
        membership = self.assert_member(workspace_id, user_id)
        if membership.role not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "You don't have permission to do this")
        return membership

    def list_members(self, workspace_id: uuid.UUID, user_id: uuid.UUID) -> list[WorkspaceMemberResponse]:
        self.assert_member(workspace_id, user_id)
        rows = self.repo.list_members(workspace_id)
        return [
            WorkspaceMemberResponse(
                id=member.id, user_id=user.id, name=user.name, email=user.email,
                role=member.role.value, joined_at=member.created_at,
            )
            for member, user in rows
        ]

    def invite_member(self, workspace_id: uuid.UUID, actor_id: uuid.UUID, payload: InviteMemberRequest) -> WorkspaceMemberResponse:
        self.assert_role(workspace_id, actor_id, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN])

        user = self.user_repo.get_by_email(payload.email)
        if not user:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "No account with that email exists yet - they need to sign up first",
            )
        if self.repo.get_membership(workspace_id, user.id):
            raise HTTPException(status.HTTP_409_CONFLICT, "This person is already a member of the workspace")

        member = self.repo.add_member(workspace_id, user.id, WorkspaceRole(payload.role))
        return WorkspaceMemberResponse(
            id=member.id, user_id=user.id, name=user.name, email=user.email,
            role=member.role.value, joined_at=member.created_at,
        )

    def update_member_role(
        self, workspace_id: uuid.UUID, member_id: uuid.UUID, actor_id: uuid.UUID, payload: UpdateMemberRoleRequest
    ) -> WorkspaceMemberResponse:
        self.assert_role(workspace_id, actor_id, [WorkspaceRole.OWNER])

        member = self.repo.get_member_by_id(workspace_id, member_id)
        if not member:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

        new_role = WorkspaceRole(payload.role)
        if member.role == WorkspaceRole.OWNER and new_role != WorkspaceRole.OWNER and self.repo.count_owners(workspace_id) <= 1:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "A workspace must have at least one owner")

        updated = self.repo.update_role(member, new_role)
        user = self.user_repo.get_by_id(str(updated.user_id))
        return WorkspaceMemberResponse(
            id=updated.id, user_id=updated.user_id, name=user.name, email=user.email,
            role=updated.role.value, joined_at=updated.created_at,
        )

    def remove_member(self, workspace_id: uuid.UUID, member_id: uuid.UUID, actor_id: uuid.UUID) -> None:
        self.assert_role(workspace_id, actor_id, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN])

        member = self.repo.get_member_by_id(workspace_id, member_id)
        if not member:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

        if member.role == WorkspaceRole.OWNER and self.repo.count_owners(workspace_id) <= 1:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "A workspace must have at least one owner")

        self.repo.remove_member(member)
