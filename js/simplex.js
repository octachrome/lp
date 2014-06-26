function solution(prob, mat) {
    var sol = {};
    var constraints = prob.constraints;
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            if (constraint.slackVar) {
                var coef = mat.getByVar(i, constraint.slackVar);
                sol[constraint.slackVar] = constraint.rhs / coef;
            }
        }
    }
    return sol;
}

function pivotVar(mat) {
    var p = {
        sym: mat.vars[0],
        index: 0
    };
    var obj = mat.rows[mat.rows.length - 1] ;
    var min = obj[0];
    for (var i = 1; i < mat.vars.length; i++) {
        if (obj[i] < min) {
            p = {
                sym: mat.vars[i],
                index: i
            }
            min = obj[i];
        }
    }
    if (min < 0) {
        return p;
    } else {
        return null;
    }
}

function pivotRow(mat, pivotVar) {
    var index = null;
    var min = null;

    for (var i = 0; i < mat.rows.length - 1; i++) {
        var v = mat.rows[i][pivotVar.index];
        if (v <= 0) {
            continue;
        }
        var r = mat.rhs[i] / v;
        if (min === null || r < min) {
            min = r;
            index = i;
        }
    }

    return index;
}
