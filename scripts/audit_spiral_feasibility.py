"""Audit the app's spiral features with SciPy HiGHS. See DEVELOPMENT_LOG.md."""

import argparse
import hashlib
import json
from pathlib import Path
import sys

import numpy as np
import scipy
from scipy.optimize import linprog


SOLVER = "highs"
SOLVER_TOLERANCE = 1e-9
VALIDATION_TOLERANCE = 1e-8


def audit(features, labels):
    features = np.asarray(features, dtype=float)
    labels = np.asarray(labels)
    if not np.isin(labels, [0, 1]).all():
        raise ValueError("Expected binary labels 0 and 1")

    # A trailing 1 gives the intercept. SciPy accepts upper-bound inequalities.
    design = np.column_stack((features, np.ones(len(features))))
    signed_design = (2 * labels - 1)[:, None] * design
    result = linprog(
        np.zeros(design.shape[1]),
        A_ub=-signed_design,
        b_ub=-np.ones(len(features)),
        bounds=[(None, None)] * design.shape[1],
        method=SOLVER,
        options={
            "primal_feasibility_tolerance": SOLVER_TOLERANCE,
            "dual_feasibility_tolerance": SOLVER_TOLERANCE,
        },
    )
    outcome = "infeasible" if result.status == 2 else "inconclusive"
    coefficients = None
    minimum_margin = None
    if result.status == 0 and result.x is not None:
        margins = signed_design @ result.x
        if np.isfinite(result.x).all() and np.isfinite(margins).all():
            minimum_margin = float(np.min(margins))
            if minimum_margin >= 1 - VALIDATION_TOLERANCE:
                outcome = "feasible"
                coefficients = result.x.tolist()

    return {
        "dimension": features.shape[1],
        "coefficientOrder": [f"w{i + 1}" for i in range(features.shape[1])] + ["b"],
        "statusCode": result.status,
        "statusMessage": result.message,
        "outcome": outcome,
        "coefficients": coefficients,
        "minimumMargin": minimum_margin,
    }


def validate_solver():
    xor = np.array([[1, 1], [-1, 1], [-1, -1], [1, -1]])
    labels = [1, 0, 1, 0]
    controls = [
        ("separable-2d", [[-2, 0], [-1, 1], [1, 0], [2, 1]], [0, 0, 1, 1], "feasible"),
        ("xor-2d", xor, labels, "infeasible"),
        ("xor-interaction", np.column_stack((xor, xor[:, 0] * xor[:, 1])), labels, "feasible"),
    ]
    results = []
    for name, features, labels, expected in controls:
        result = audit(features, labels)
        if result["outcome"] != expected:
            raise RuntimeError(f"Solver control {name} expected {expected}: {result}")
        results.append({"id": name, **result})
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Path for the result JSON")
    args = parser.parse_args()
    controls = validate_solver()
    raw = sys.stdin.buffer.read()
    data = json.loads(raw)
    observations = data["observations"]
    inputs = [[point["x1"], point["x2"]] for point in observations]
    labels = [point["label"] for point in observations]
    lifted = []
    for mapping in data["mappings"]:
        features = np.column_stack((inputs, mapping["heights"]))
        lifted.append({
            "id": mapping["id"], "label": mapping["label"], "expression": mapping["expression"],
            **audit(features, labels),
        })

    artifact = {
        "dataset": {
            "id": data["datasetId"],
            "observationCount": len(observations),
            "inputSha256": hashlib.sha256(raw).hexdigest(),
        },
        "solver": {
            "library": "SciPy",
            "version": scipy.__version__,
            "method": SOLVER,
            "primalFeasibilityTolerance": SOLVER_TOLERANCE,
            "dualFeasibilityTolerance": SOLVER_TOLERANCE,
            "validationTolerance": VALIDATION_TOLERANCE,
            "requiredMargin": 1,
        },
        "controls": controls,
        "original2d": audit(inputs, labels),
        "transformations": lifted,
    }
    args.output.write_text(json.dumps(artifact, indent=2, allow_nan=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
