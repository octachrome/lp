function initialSol(prob, mat) {
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
