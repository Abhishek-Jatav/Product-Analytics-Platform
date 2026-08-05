from datetime import date, timedelta


def test_dashboard_summary_computes_correct_metrics(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    # user_1: active today, purchased today (returning - first seen 35 days ago, outside the 30-day window)
    seed_event(project_id, "user_1", "Signup", days_ago=35)
    seed_event(project_id, "user_1", "Purchase", {"amount": 50}, days_ago=0)

    # user_2: brand new today (new user, no purchase)
    seed_event(project_id, "user_2", "Signup", days_ago=0)

    start = (date.today() - timedelta(days=29)).isoformat()
    end = date.today().isoformat()

    r = client.get(
        f"/api/v1/projects/{project_id}/analytics/summary",
        headers=headers,
        params={"start_date": start, "end_date": end},
    )
    assert r.status_code == 200
    data = r.json()["data"]

    assert data["dau"] == 2
    assert data["active_users"] == 2
    assert data["new_users"] == 1  # only user_2 (user_1's first event was outside the 30-day window)
    assert data["returning_users"] == 1  # user_1
    assert data["revenue"] == 50.0
    assert data["conversion_rate"] == 50.0  # 1 of 2 active users converted


def test_dashboard_trend_has_one_point_per_day(client, project_setup, seed_event):
    headers, project_id, _ = project_setup
    seed_event(project_id, "user_1", "Signup", days_ago=0)

    start = (date.today() - timedelta(days=6)).isoformat()
    end = date.today().isoformat()

    r = client.get(
        f"/api/v1/projects/{project_id}/analytics/trend", headers=headers, params={"start_date": start, "end_date": end}
    )
    points = r.json()["data"]["points"]
    assert len(points) == 7
    assert points[-1]["active_users"] == 1  # today
    assert points[0]["active_users"] == 0
