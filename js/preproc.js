function negateExpr(expr) {
    for (var i = 0; i < expr.length; i++) {
        var term = expr[i];
        term.coef = -term.coef;
    }
}

function canonical(prob) {
    var nextSlack = 0;

    var objective = prob.objective;
    if (objective) {
        if (objective.dir === 'minimise') {
            objective.dir = 'maximise';
            negateExpr(objective.expr);
        }
    }

    var constraints = prob.constraints;
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            if (constraint.rhs < 0) {
                constraint.rhs = -constraint.rhs;
                negateExpr(constraint.expr);
                if (constraint.op === '<=') {
                    constraint.op = '>=';
                } else if (constraint.op === '>=') {
                    constraint.op = '<=';
                }
            }

            if (constraint.op === '<=') {
                var coef = 1;
            } else if (constraint.op === '>=') {
                coef = -1;
            } else {
                continue;
            }

            var slackVar = '_s' + nextSlack++;
            constraint.expr.push({
                sym: slackVar,
                coef: coef
            });
            constraint.slackVar = slackVar;
            constraint.op = '=';
        }
    }
    return prob;
}
