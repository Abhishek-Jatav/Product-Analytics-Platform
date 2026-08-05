"""
A/B test analysis: given "Experiment Viewed" exposure events (tagged with
which variant a user was bucketed into) and conversion events, computes
each variant's conversion rate, statistical significance vs. control
(two-proportion z-test), and declares a winner if one variant is both
better AND statistically significant at the 95% confidence level.
"""
from typing import Optional

import pandas as pd
from scipy import stats

SIGNIFICANCE_THRESHOLD = 0.05


def _first_exposure_per_user(exposure_frame: pd.DataFrame, experiment_id: str) -> dict[str, tuple[str, pd.Timestamp]]:
    """distinct_id -> (variant_name, first_exposure_timestamp), for this experiment only."""
    if exposure_frame.empty:
        return {}

    relevant = exposure_frame[exposure_frame["properties"].apply(lambda p: (p or {}).get("experiment_id") == experiment_id)]
    if relevant.empty:
        return {}

    result: dict[str, tuple[str, pd.Timestamp]] = {}
    for distinct_id, group in relevant.groupby("distinct_id"):
        first_row = group.sort_values("timestamp").iloc[0]
        variant = first_row["properties"].get("variant")
        if variant:
            result[distinct_id] = (variant, first_row["timestamp"])
    return result


def two_proportion_z_test(conversions_a: int, n_a: int, conversions_b: int, n_b: int) -> Optional[float]:
    """Two-tailed p-value for whether B's conversion rate differs from A's. None if not computable."""
    if n_a == 0 or n_b == 0:
        return None

    p1, p2 = conversions_a / n_a, conversions_b / n_b
    p_pool = (conversions_a + conversions_b) / (n_a + n_b)

    if p_pool in (0, 1):
        return None  # no variance, e.g. 0% or 100% conversion everywhere

    se = (p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b)) ** 0.5
    if se == 0:
        return None

    z = (p2 - p1) / se
    return float(2 * (1 - stats.norm.cdf(abs(z))))


def compute_experiment_results(
    exposure_frame: pd.DataFrame,
    conversion_frame: pd.DataFrame,
    experiment_id: str,
    variant_names: list[str],
    control_name: str,
) -> list[dict]:
    exposures = _first_exposure_per_user(exposure_frame, experiment_id)

    converted_ids: set[str] = set(conversion_frame["distinct_id"]) if not conversion_frame.empty else set()

    counts: dict[str, dict[str, int]] = {name: {"exposures": 0, "conversions": 0} for name in variant_names}
    for distinct_id, (variant, exposed_at) in exposures.items():
        if variant not in counts:
            continue
        counts[variant]["exposures"] += 1

        if distinct_id in converted_ids:
            user_conversions = conversion_frame[conversion_frame["distinct_id"] == distinct_id]
            if (user_conversions["timestamp"] >= exposed_at).any():
                counts[variant]["conversions"] += 1

    control = counts.get(control_name, {"exposures": 0, "conversions": 0})
    control_rate = (control["conversions"] / control["exposures"] * 100) if control["exposures"] else 0.0

    results = []
    for name in variant_names:
        c = counts[name]
        rate = round((c["conversions"] / c["exposures"]) * 100, 2) if c["exposures"] else 0.0
        is_control = name == control_name

        p_value = None
        uplift = None
        is_significant = False
        if not is_control:
            p_value = two_proportion_z_test(control["conversions"], control["exposures"], c["conversions"], c["exposures"])
            uplift = round(rate - control_rate, 2)
            is_significant = p_value is not None and p_value < SIGNIFICANCE_THRESHOLD

        results.append(
            {
                "name": name,
                "is_control": is_control,
                "exposures": c["exposures"],
                "conversions": c["conversions"],
                "conversion_rate": rate,
                "uplift_vs_control": uplift,
                "p_value": round(p_value, 4) if p_value is not None else None,
                "is_significant": is_significant,
            }
        )

    return results
