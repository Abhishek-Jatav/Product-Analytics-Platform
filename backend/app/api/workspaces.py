"""
Workspace endpoints: create/list workspaces, and manage team membership
(list, invite, change role, remove) with role-based permissions.
"""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.response import success_response
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.workspace import CreateWorkspaceRequest, InviteMemberRequest, UpdateMemberRoleRequest
from app.services.workspace_service import WorkspaceService

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.post("")
def create_workspace(
    payload: CreateWorkspaceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspace = WorkspaceService(db).create(payload, owner_id=current_user.id)
    return success_response("Workspace created successfully", workspace.model_dump())


@router.get("")
def list_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    workspaces = WorkspaceService(db).list_for_user(current_user.id)
    return success_response("Workspaces fetched", [w.model_dump() for w in workspaces])


@router.get("/{workspace_id}/members")
def list_members(
    workspace_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    members = WorkspaceService(db).list_members(workspace_id, current_user.id)
    return success_response("Members fetched", [m.model_dump() for m in members])


@router.post("/{workspace_id}/members")
def invite_member(
    workspace_id: uuid.UUID,
    payload: InviteMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = WorkspaceService(db).invite_member(workspace_id, current_user.id, payload)
    return success_response("Member added successfully", member.model_dump())


@router.patch("/{workspace_id}/members/{member_id}")
def update_member_role(
    workspace_id: uuid.UUID,
    member_id: uuid.UUID,
    payload: UpdateMemberRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = WorkspaceService(db).update_member_role(workspace_id, member_id, current_user.id, payload)
    return success_response("Member role updated", member.model_dump())


@router.delete("/{workspace_id}/members/{member_id}")
def remove_member(
    workspace_id: uuid.UUID,
    member_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    WorkspaceService(db).remove_member(workspace_id, member_id, current_user.id)
    return success_response("Member removed successfully")
