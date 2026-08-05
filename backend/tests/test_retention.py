def test_day_n_retention(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    # user_1: first seen 10 days ago, returned on day 1, not on day 7
    seed_event(project_id, "user_1", "Signup", days_ago=10)
    seed_event(project_id, "user_1", "Login", days_ago=9)

    # user_2: first seen 10 days ago, never returned
    seed_event(project_id, "user_2", "Signup", days_ago=10)

    r = client.get(f"/api/v1/projects/{project_id}/retention/summary", headers=headers)
    data = r.json()["data"]

    assert data["day1"]["eligible_users"] == 2
    assert data["day1"]["retained_users"] == 1
    assert data["day1"]["rate"] == 50.0

    assert data["day7"]["eligible_users"] == 2
    assert data["day7"]["retained_users"] == 0
    assert data["day7"]["rate"] == 0.0


def test_retention_matrix_cohort_grouping(client, project_setup, seed_event):
    headers, project_id, _ = project_setup

    seed_event(project_id, "user_1", "Signup", days_ago=5)
    seed_event(project_id, "user_1", "Login", days_ago=4)  # active day 1 after cohort start
    seed_event(project_id, "user_2", "Signup", days_ago=5)

    r = client.get(
        f"/api/v1/projects/{project_id}/retention/matrix",
        headers=headers,
        params={"period": "day", "num_periods": 3, "max_cohorts": 5},
    )
    cohorts = r.json()["data"]["cohorts"]
    assert len(cohorts) == 1
    assert cohorts[0]["cohort_size"] == 2
    assert cohorts[0]["percentages"][0] == 100.0  # everyone active on their signup day
    assert cohorts[0]["percentages"][1] == 50.0  # only user_1 returned the next day
